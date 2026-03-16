import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Kaar Knowledge-Innovation Intelligence Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "INSECURE_SECRET_FOR_MOCK_ENV"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    
    # For SQLAlchemy 2.0 + psycopg 3 with NeonDB Pooler, we must adjust the connection string. 
    # The '?sslmode=require' is moved to connect_args in models/base.py if needed, 
    # but for typical Neon URIs with psycopg, just ensuring the right scheme is enough.
    SQLALCHEMY_DATABASE_URI: str = os.getenv("DATABASE_URL", "postgresql+psycopg://neondb_owner:npg_YjGsvpVc56qy@ep-morning-union-am7gbqih-pooler.c-5.us-east-1.aws.neon.tech/neondb")

settings = Settings()
