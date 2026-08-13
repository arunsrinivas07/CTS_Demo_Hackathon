import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()

class Settings(BaseSettings):
    app_name: str = os.getenv("APP_NAME")
    app_env: str = os.getenv("APP_ENV")

    database_url: str = os.getenv("DATABASE_URL")   

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()