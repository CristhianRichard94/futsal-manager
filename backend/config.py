from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables / .env file."""

    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/futsal"
    NEXTAUTH_SECRET: str = "change-me"
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    MERCADOPAGO_ACCESS_TOKEN: str = ""
    DEPOSIT_AMOUNT: int = 1000
    FRONTEND_BASE_URL: str = "http://localhost:3000"
    BACKEND_BASE_URL: str = "http://localhost:8000"

    # Shared secret between the frontend and this backend, used only to
    # authenticate the frontend's server-side call to POST /auth/sync.
    INTERNAL_SYNC_SECRET: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def allowed_origins_list(self) -> list[str]:
        if self.ALLOWED_ORIGINS.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]


settings = Settings()
