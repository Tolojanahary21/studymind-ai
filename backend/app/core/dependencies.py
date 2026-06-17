from fastapi import Depends
from fastapi import HTTPException
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.models.user import User
from app.core.security import decode_token

security = HTTPBearer()


def get_current_user(
    credentials=Depends(security),
    db: Session = Depends(get_db)
):

    token = credentials.credentials

    payload = decode_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    user_id = payload.get("sub")

    user = (
        db.query(User)
        .filter(User.id == int(user_id))
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user