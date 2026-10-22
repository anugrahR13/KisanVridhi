import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

is_vercel = bool(os.getenv("VERCEL"))
default_db_url = "sqlite:////tmp/sustainable_farming.db" if is_vercel else "sqlite:///./sustainable_farming.db"
default_upload_dir = "/tmp/uploads" if is_vercel else "uploads"

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Powered Gamified Platform for Personalized Sustainable Farming"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("JWT_SECRET", "supersecretkeyforsustainablefarmingplatform2026_btech_project")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database configuration - defaults to SQLite in /tmp for Vercel, supports PostgreSQL
    DATABASE_URL: str = os.getenv("DATABASE_URL", default_db_url)
    
    # Upload settings
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", default_upload_dir)
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5 MB
    ALLOWED_EXTENSIONS: List[str] = [".jpg", ".jpeg", ".png", ".webp"]
    
    # AI settings
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    
    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings()

# Ensure uploads directory exists
try:
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
except Exception as e:
    print(f"[CONFIG] Note on upload dir: {e}")

