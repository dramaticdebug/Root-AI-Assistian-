import re
from loguru import logger

class TextCleaner:
    @staticmethod
    def clean_turkish_text(text: str) -> str:
        if not text:
            return ""
        
        # 1. Remove unnecessary whitespace
        text = " ".join(text.split())
        
        # 2. Remove common Whisper artifacts/hallucinations for silence
        # (e.g. "Teşekkürler", "Altyazı", "İzlediğiniz için teşekkürler" etc. if they appear unexpectedly)
        artifacts = [
            r"izlediğiniz için teşekkürler",
            r"altyazı",
            r"teşekkür ederim",
            r"bir sonraki videoda görüşmek üzere"
        ]
        
        for artifact in artifacts:
            text = re.sub(artifact, "", text, flags=re.IGNORECASE)
        
        # 3. Clean trailing dots if they are many
        text = re.sub(r"\.{2,}", ".", text)
        
        # 4. Strip again
        text = text.strip()
        
        return text

    @staticmethod
    def format_for_assistant(text: str) -> str:
        """Final touch for AI assistant consumption."""
        if not text: return ""
        
        # Ensure it's not just a single punctuation
        if len(text) <= 1 and text in ".,!?":
            return ""
            
        return text
