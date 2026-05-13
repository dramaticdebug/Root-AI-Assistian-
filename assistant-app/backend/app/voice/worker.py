import asyncio
from loguru import logger
from .whisper_service import whisper_service
from .audio_utils import pcm_to_wav, cleanup_file
from .text_cleaner import TextCleaner
import time

class TranscriptionWorker:
    def __init__(self):
        self.queue = asyncio.Queue()
        self.is_running = False
        self._worker_task = None

    async def start(self):
        if self.is_running: return
        self.is_running = True
        self._worker_task = asyncio.create_task(self._process_queue())
        logger.info("🚀 Transcription Worker started")

    async def stop(self):
        self.is_running = False
        if self._worker_task:
            self._worker_task.cancel()
            await asyncio.gather(self._worker_task, return_exceptions=True)
        logger.info("🛑 Transcription Worker stopped")

    async def add_job(self, audio_data: bytes, callback, language="tr"):
        await self.queue.put((audio_data, callback, language))

    async def _process_queue(self):
        while self.is_running:
            try:
                audio_data, callback, language = await self.queue.get()
                logger.info(f"👷 Worker: Processing new job (Size: {len(audio_data)} bytes)")
                
                start_time = time.time()
                temp_wav = None
                try:
                    # 1. PCM -> WAV
                    temp_wav = pcm_to_wav(audio_data)
                    
                    # 2. Whisper Inference (CPU Optimized)
                    # Use run_in_executor to not block the event loop
                    loop = asyncio.get_event_loop()
                    raw_text = await loop.run_in_executor(None, whisper_service.transcribe, temp_wav, language)
                    
                    # 3. Clean Text
                    clean_text = TextCleaner.clean_turkish_text(raw_text)
                    
                    # 4. Metrics
                    inference_time = (time.time() - start_time) * 1000
                    
                    # 5. Execute Callback (Send via WebSocket)
                    if clean_text:
                        await callback(raw_text, clean_text, inference_time)
                        
                except Exception as e:
                    logger.error(f"Worker processing error: {e}")
                finally:
                    if temp_wav:
                        cleanup_file(temp_wav)
                    self.queue.task_done()
                    
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Worker queue error: {e}")
                await asyncio.sleep(1)

# Singleton Instance
transcription_worker = TranscriptionWorker()
