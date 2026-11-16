import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load .env file from backend or parent
load_dotenv()
load_dotenv("../.env")

class Settings(BaseSettings):
    PROJECT_NAME: str = "CareerPilot AI Resume Engine"
    API_V1_STR: str = "/api"
    SUPABASE_URL: str = os.getenv("VITE_SUPABASE_URL", os.getenv("SUPABASE_URL", "https://jqanihczhljhdkdenxoi.supabase.co"))
    SUPABASE_ANON_KEY: str = os.getenv("VITE_SUPABASE_ANON_KEY", os.getenv("SUPABASE_ANON_KEY", "sb_publishable_OB6wNXixfdzOHpKjmpB7GA_rHCXcr1l"))
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-1.5-flash")
    MAX_FILE_SIZE: int = 5 * 1024 * 1024  # 5 MB
    MAX_FILE_SIZE_BYTES: int = 5 * 1024 * 1024  # 5 MB
    ALLOWED_MIME_TYPES: list[str] = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "text/plain"
    ]
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "*"
    ]

settings = Settings()
