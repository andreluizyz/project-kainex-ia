from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    secret_key: str = Field(..., alias="SECRET_KEY")
    algorithm: str = Field(default="HS256", alias="ALGORITHM")
    access_token_expire_minutes: int = Field(default=10080, alias="ACCESS_TOKEN_EXPIRE_MINUTES")

    llm_api_url: str = Field(default="http://localhost:11434/api/generate", alias="LLM_API_URL")
    llm_model: str = Field(default="llama3", alias="LLM_MODEL")
    llm_timeout_seconds: int = Field(default=120, alias="LLM_TIMEOUT_SECONDS")
    llm_max_history_messages: int = Field(default=10, alias="LLM_MAX_HISTORY_MESSAGES")
    llm_max_context_chunks: int = Field(default=4, alias="LLM_MAX_CONTEXT_CHUNKS")


settings = Settings()

SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes

LLM_API_URL = settings.llm_api_url
LLM_MODEL = settings.llm_model
LLM_TIMEOUT_SECONDS = settings.llm_timeout_seconds
LLM_MAX_HISTORY_MESSAGES = settings.llm_max_history_messages
LLM_MAX_CONTEXT_CHUNKS = settings.llm_max_context_chunks
