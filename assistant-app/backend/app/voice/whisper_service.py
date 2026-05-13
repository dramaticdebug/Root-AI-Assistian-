import whisper
import torch
import os
from loguru import logger
from typing import Optional

class WhisperService:
    _instance: Optional['WhisperService'] = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(WhisperService, cls).__new__(cls)
            cls._instance._load_model()
        return cls._instance

    def _load_model(self):
        if self._model is not None:
            return
            
        try:
            model_name = os.getenv("WHISPER_MODEL", "small")
            device = "cuda" if torch.cuda.is_available() else "cpu"
            logger.info(f"⏳ Loading Whisper model '{model_name}' on {device} (Turkish Optimized)... This may take a moment.")
            
            self._model = whisper.load_model(model_name, device=device)
            logger.info("✅ Whisper model loaded and ready.")
        except Exception as e:
            logger.error(f"❌ Failed to load Whisper model: {e}")
            raise e

    def transcribe(self, audio_path: str, language: str = "tr") -> str:
        if not self._model:
            raise Exception("Whisper model not loaded")
        
        try:
            logger.info(f"Transcribing audio file (lang={language}): {audio_path}")
            # Force language to Turkish and ensure CPU compatibility
            result = self._model.transcribe(
                audio_path, 
                language=language,
                fp16=torch.cuda.is_available(),
                task="transcribe"
            )
            text = result.get("text", "").strip()
            return text
        except Exception as e:
            logger.error(f"Transcription error: {e}")
            return ""

# Singleton Instance
whisper_service = WhisperService()
