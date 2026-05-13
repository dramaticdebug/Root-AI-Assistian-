import re
from typing import Optional, Tuple, Dict, Any
from loguru import logger

class IntentProcessor:
    def __init__(self):
        # Basic regex-based intent mapping
        # In a real system, this would be an LLM or a more complex NLP model
        self.rules = [
            (r"(chrome|tarayıcı|browser)\s*(aç|başlat|çalıştır)", "open_chrome", {}),
            (r"(spotify|müzik)\s*(aç|başlat|çalıştır)", "open_spotify", {}),
            (r"(discord|mesajlaşma)\s*(aç|başlat|çalıştır)", "open_discord", {}),
            (r"(sistem|bilgisayar|durum)\s*(bilgisi|hakkında|nasıl)", "get_system_info", {}),
            (r"(klasör|dosya gezgini)\s*(aç|başlat)", "open_folder", {"path": "."}),
            (r"aç\s+(.*)", "open_folder", lambda m: {"path": m.group(1)}), # "aç C:\"
        ]

    def process(self, text: str) -> Optional[Tuple[str, Dict[str, Any]]]:
        text = text.lower().strip()
        logger.debug(f"Processing intent for: {text}")

        for pattern, cmd_name, params in self.rules:
            match = re.search(pattern, text)
            if match:
                logger.info(f"Intent matched: {cmd_name}")
                
                # If params is a function, call it with match object
                if callable(params):
                    actual_params = params(match)
                else:
                    actual_params = params
                    
                return cmd_name, actual_params

        return None

# Singleton
processor = IntentProcessor()
