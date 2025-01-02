from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    CORS_ORIGINS: str
    FIREBASE_ADMIN_CREDENTIALS: str
    ENCRYPTION_KEY: str
    CANVAS_API_BASE_URL: str
    CURRENT_TERM_ID: int = 7109

    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings():
    return Settings()