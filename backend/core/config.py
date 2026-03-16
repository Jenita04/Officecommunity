import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Kaar Knowledge-Innovation Intelligence Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "INSECURE_SECRET_FOR_MOCK_ENV"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    
    # Check environment variable first, then fallback to local sqlite if nothing
    DEFAULT_DB_URL = "postgresql+psycopg2://neondb_owner:npg_YjGsvpVc56qy@ep-morning-union-am7gbqih-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    SQLALCHEMY_DATABASE_URI: str = os.getenv("DATABASE_URL", DEFAULT_DB_URL)

settings = Settings()
