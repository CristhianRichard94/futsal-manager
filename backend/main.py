import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from config import settings
from database import Base, engine
from routers import auth_router, fields, payments, reservations, venues

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    app = FastAPI(title="Futsal Manager API")

    allow_credentials = True
    if settings.allowed_origins_list == ["*"] and allow_credentials:
        # Fail closed: wildcard origins combined with credentialed requests
        # is an insecure configuration in every environment (including
        # prod). Force explicit ALLOWED_ORIGINS configuration.
        raise RuntimeError(
            "Insecure CORS configuration: ALLOWED_ORIGINS resolves to '*' while "
            "allow_credentials=True. Set ALLOWED_ORIGINS to an explicit, "
            "comma-separated list of origins (e.g. http://localhost:3000)."
        )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=allow_credentials,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(venues.router)
    app.include_router(fields.router)
    app.include_router(reservations.router)
    app.include_router(payments.router)
    app.include_router(auth_router.router)

    @app.on_event("startup")
    def on_startup() -> None:
        # Required for the Reservation.reservations_no_overlap exclusion
        # constraint (gist index on an integer equality + tsrange overlap).
        with engine.begin() as connection:
            connection.execute(text("CREATE EXTENSION IF NOT EXISTS btree_gist"))

        # Fallback to metadata.create_all instead of Alembic migrations
        # (see backend README for rationale). This is a no-op if tables
        # already exist.
        Base.metadata.create_all(bind=engine)

    @app.get("/health", tags=["health"])
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
