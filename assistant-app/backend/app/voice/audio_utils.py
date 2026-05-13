import numpy as np
import soundfile as sf
import os
import tempfile
from loguru import logger


def pcm_to_wav(pcm_data: bytes, sample_rate: int = 16000, channels: int = 1) -> str:
    """
    Convert raw PCM Int16 bytes → temporary WAV file (16kHz, mono, PCM_16).
    Returns the path to the temp file. Caller is responsible for cleanup.
    """
    try:
        if len(pcm_data) == 0:
            raise ValueError("pcm_data is empty — nothing to convert")

        # Raw bytes → numpy int16 array
        audio_array = np.frombuffer(pcm_data, dtype=np.int16)

        if audio_array.size == 0:
            raise ValueError("Decoded audio_array is empty")

        duration_ms = (len(audio_array) / sample_rate) * 1000
        rms         = float(np.sqrt(np.mean(np.square(audio_array.astype(np.float32)))))

        logger.debug(
            f"[AUDIO_UTILS] pcm_to_wav | samples={len(audio_array)} | "
            f"duration={duration_ms:.0f}ms | RMS={rms:.1f} | SR={sample_rate}Hz"
        )

        temp_path = os.path.join(
            tempfile.gettempdir(), f"voice_{os.urandom(4).hex()}.wav"
        )

        # ✅ subtype='PCM_16' ensures proper 16-bit WAV — Whisper compatible
        sf.write(temp_path, audio_array, sample_rate, subtype="PCM_16")

        file_size = os.path.getsize(temp_path)
        logger.debug(
            f"[AUDIO_UTILS] WAV written → {temp_path} ({file_size/1024:.1f}KB)"
        )
        return temp_path

    except Exception as e:
        logger.error(f"[AUDIO_UTILS] pcm_to_wav error: {e}")
        raise


def cleanup_file(file_path: str):
    """Delete a temp file, logging any errors."""
    try:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
            logger.debug(f"[AUDIO_UTILS] Cleaned temp file: {file_path}")
    except Exception as e:
        logger.error(f"[AUDIO_UTILS] cleanup_file error for '{file_path}': {e}")


def is_silent(pcm_data: bytes, threshold: int = 200) -> bool:
    """
    Simple energy-based VAD.
    Returns True if RMS of the signal is below `threshold` (treat as silence).
    Default threshold 200 suits 16-bit mic input well.
    """
    try:
        if not pcm_data:
            return True

        audio_array = np.frombuffer(pcm_data, dtype=np.int16)

        if len(audio_array) == 0:
            return True

        rms = float(np.sqrt(np.mean(np.square(audio_array.astype(np.float32)))))
        silent = rms < threshold

        logger.debug(
            f"[AUDIO_UTILS] VAD | RMS={rms:.1f} | threshold={threshold} | "
            f"{'SILENT' if silent else 'SPEECH'}"
        )
        return silent

    except Exception as e:
        logger.error(f"[AUDIO_UTILS] is_silent error: {e}")
        return True  # Fail-safe: treat as silent
