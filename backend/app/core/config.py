"""
SaveSmart Core Settings & Configuration
Loaded via Pydantic Settings from environment variables or .env file.
"""
from typing import List
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    DEBUG: bool = True

    # MongoDB Atlas Configuration
    MONGODB_URI: str = ""
    MONGODB_DB_NAME: str = "savesmart_db"

    # Google Gemini API Configuration
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"

    # Currency Standard
    CURRENCY: str = "INR"

    # CORS Configuration
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,*"

    @property
    def cors_origins(self) -> List[str]:
        if not self.ALLOWED_ORIGINS:
            return ["*"]
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
