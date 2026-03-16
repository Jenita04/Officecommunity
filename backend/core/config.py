from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Kaar Knowledge-Innovation Intelligence Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "INSECURE_SECRET_FOR_MOCK_ENV"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    SQLALCHEMY_DATABASE_URI: str = "sqlite:///./kaariq.db"  # Using SQLite for easy local dev mapping

settings = Settings()
