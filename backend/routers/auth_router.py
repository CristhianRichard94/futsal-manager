from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import UserOut, UserSyncIn

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/sync", response_model=UserOut)
def sync_user(payload: UserSyncIn, db: Session = Depends(get_db)) -> User:
    """Upsert a user by google_id/email. Called once by the frontend NextAuth
    callback on sign-in. No auth required (this endpoint establishes identity).
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
