from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Perspective Prism MVP"
    OPENAI_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""
    GOOGLE_CSE_ID: str = ""
    SEARCH_PROVIDER: str = "google"

    class Config:
        env_file = ".env"

settings = Settings()
