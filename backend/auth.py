from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from config import settings
from database import get_db
from models import User, UserRole

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Decode and verify the bearer token and load the corresponding user row.

    TOKEN CONTRACT (must be satisfied by the frontend, separate task):
    This endpoint expects a plain, short-lived JWT signed with HS256 using
    NEXTAUTH_SECRET, containing at minimum an `email` (or `sub`) claim with
    the user's email address.

    IMPORTANT: NextAuth v4's default JWT session strategy produces an
    *encrypted* JWE cookie, not a plain decodable JWT — python-jose's
    jwt.decode() cannot parse that format, and forwarding the raw NextAuth
    session cookie here will always 401.

    The frontend must instead mint a dedicated, short-lived HS256 JWT (e.g.
    via a `/api/token` Next.js route using the `jsonwebtoken` package and
    NEXTAUTH_SECRET) after sign-in, and send THAT token as the Bearer
    credential on requests to this API — not the NextAuth session cookie
    itself.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials",
        )

    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.NEXTAUTH_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    email = payload.get("email") or payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing user identity claim",
        )

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user


def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.venue_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Venue admin role required",
        )
    return current_user
