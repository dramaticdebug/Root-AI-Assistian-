from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os

class Settings(BaseSettings):
    # App config
    APP_NAME: str = "Root AI Assistant"
    APP_ENV: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    
    # API config
    API_V1_STR: str = "/api"
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173,tauri://localhost,http://localhost:1420"
    
    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    # AI
    OPENAI_API_KEY: str = ""
    
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        extra="ignore"
    )

settings = Settings()
