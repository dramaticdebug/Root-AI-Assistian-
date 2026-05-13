from .whisper_service import whisper_service
from .audio_utils import pcm_to_wav, cleanup_file, is_silent
from .audio_buffer import AudioBuffer
from .text_cleaner import TextCleaner
from .worker import transcription_worker
from loguru import logger
import asyncio
from typing import Callable
import time

# Minimum buffer before attempting transcription: 0.2s @ 16kHz mono int16 = 6400 bytes
MIN_BUFFER_BYTES = 6400
# VAD threshold: RMS < 30 treated as silence.
# Observed mic RMS ~115 even during speech → old threshold of 150 was blocking everything.
# At 30 we only skip truly dead silence (unplugged mic, muted track, etc.)
VAD_THRESHOLD = 30
# If buffer grows beyond this, force-transcribe even if VAD says silent
# (prevents unbounded accumulation and catches "quiet" speech)
FORCE_TRANSCRIBE_BYTES = 200 * 1024  # 200 KB ≈ ~6 seconds of audio



class VoiceTranscriber:
    def __init__(self, session_id: str, websocket_callback: Callable):
        self.session_id   = session_id
        self.buffer       = AudioBuffer(session_id)
        self.websocket_callback = websocket_callback
        self.is_processing      = False
        self._chunk_count       = 0

    async def process_chunk(self, chunk: bytes):
        """Accept a raw PCM int16 chunk and append to buffer."""
        self._chunk_count += 1
        self.buffer.add_chunk(chunk)
        # Verbose: log every 100 chunks to avoid noise
        if self._chunk_count % 100 == 0:
            logger.debug(
                f"[TRANSCRIBER] Session {self.session_id} | "
                f"chunk #{self._chunk_count} | chunk={len(chunk)}B | "
                f"buffer={self.buffer.size_kb():.1f}KB"
            )

    async def trigger_transcription(self, language: str = "tr", is_final: bool = False):
        """Attempt to transcribe whatever is currently in the buffer."""
        if self.is_processing:
            logger.debug(
                f"[TRANSCRIBER] Session {self.session_id}: already processing, skipping trigger"
            )
            return

        data        = self.buffer.get_data()
        buffer_size = len(data)

        logger.info(
            f"[TRANSCRIBER] Session {self.session_id}: trigger | "
            f"buffer={buffer_size}B ({buffer_size/1024:.1f}KB) | final={is_final}"
        )

        # ── Minimum size gate ────────────────────────────────────────────────
        if buffer_size < MIN_BUFFER_BYTES:
            logger.debug(
                f"[TRANSCRIBER] Session {self.session_id}: buffer too small "
                f"({buffer_size}B < {MIN_BUFFER_BYTES}B), skipping"
            )
            if is_final:
                self.buffer.clear()
            return

        # ── VAD: silence detection ───────────────────────────────────────────
        force_transcribe = buffer_size >= FORCE_TRANSCRIBE_BYTES
        silent = is_silent(data, threshold=VAD_THRESHOLD)

        logger.debug(
            f"[TRANSCRIBER] Session {self.session_id}: VAD → "
            f"{'SILENT' if silent else 'SPEECH DETECTED'} (threshold={VAD_THRESHOLD}) | "
            f"force={force_transcribe} (buf={buffer_size/1024:.0f}KB)"
        )

        if silent and not force_transcribe:
            # Buffer too small or quiet AND not overflowing → skip, but clean up if large
            if buffer_size > 100 * 1024:  # > 100KB sitting silent → clear to free memory
                logger.warning(
                    f"[TRANSCRIBER] Session {self.session_id}: large silent buffer "
                    f"({buffer_size/1024:.0f}KB) → clearing to prevent accumulation"
                )
                self.buffer.clear()
            elif is_final:
                self.buffer.clear()
            return

        if silent and force_transcribe:
            logger.warning(
                f"[TRANSCRIBER] Session {self.session_id}: FORCE transcribe — "
                f"buffer={buffer_size/1024:.0f}KB >= {FORCE_TRANSCRIBE_BYTES//1024}KB limit, "
                f"VAD overridden (Whisper will handle noise)"
            )

        # ── Queue job ────────────────────────────────────────────────────────
        self.is_processing = True
        self.buffer.clear()  # Clear immediately so new audio isn't included in this job
        logger.info(
            f"[TRANSCRIBER] Session {self.session_id}: sending {buffer_size}B to worker queue"
        )

        async def on_result(raw: str, clean: str, inference_time: float):
            try:
                await self.websocket_callback(raw, clean, inference_time, is_final)
            except Exception as e:
                logger.error(f"[TRANSCRIBER] Callback error: {e}")
            finally:
                self.is_processing = False
                logger.debug(
                    f"[TRANSCRIBER] Session {self.session_id}: processing complete, "
                    f"flag reset"
                )

        await transcription_worker.add_job(data, on_result, language)
