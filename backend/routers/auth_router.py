import secrets

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from config import settings
from database import get_db
from models import User
from schemas import UserOut, UserSyncIn

router = APIRouter(prefix="/auth", tags=["auth"])


def _verify_internal_sync_secret(x_internal_sync_secret: str | None = Header(default=None)) -> None:
    """Ensure this call originates from our own frontend server, not an
    arbitrary client. The frontend's NextAuth `jwt` callback sends this
    header (server-side only, never exposed to the browser) right after a
    Google sign-in that NextAuth has already verified.
    """
    expected = settings.INTERNAL_SYNC_SECRET
    if not expected or not x_internal_sync_secret or not secrets.compare_digest(
        x_internal_sync_secret, expected
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing internal sync secret",
        )


@router.post("/sync", response_model=UserOut, dependencies=[Depends(_verify_internal_sync_secret)])
def sync_user(payload: UserSyncIn, db: Session = Depends(get_db)) -> User:
    """Upsert a user by google_id/email. Called once by the frontend NextAuth
    callback on sign-in. Requires the shared X-Internal-Sync-Secret header
    to prove the caller is our own trusted frontend server.
    """
    user = (
        db.query(User)
        .filter((User.google_id == payload.google_id) | (User.email == payload.email))
        .first()
    )

    if user:
        user.google_id = payload.google_id
        user.email = payload.email
        user.name = payload.name
        user.avatar_url = payload.avatar_url
    else:
        user = User(
            google_id=payload.google_id,
            email=payload.email,
            name=payload.name,
            avatar_url=payload.avatar_url,
        )
        db.add(user)

    db.commit()
    db.refresh(user)
    return user
