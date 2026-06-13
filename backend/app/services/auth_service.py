from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)


class AuthService:

    @staticmethod
    def register(
        db: Session,
        payload: RegisterRequest,
    ):

        existing_user = (
            db.query(User)
            .filter(User.email == payload.email)
            .first()
        )

        if existing_user:
            raise ValueError(
                "Email already exists"
            )

        user = User(
            firstname=payload.firstname,
            lastname=payload.lastname,
            email=payload.email,
            hashed_password=hash_password(
                payload.password
            ),
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        token = create_access_token(
            {
                "sub": str(user.id),
                "email": user.email,
            }
        )

        return {
            "access_token": token,
            "token_type": "bearer",
        }

    @staticmethod
    def login(
        db: Session,
        payload: LoginRequest,
    ):

        user = (
            db.query(User)
            .filter(User.email == payload.email)
            .first()
        )

        if not user:
            raise ValueError(
                "Invalid credentials"
            )

        if not verify_password(
            payload.password,
            user.hashed_password,
        ):
            raise ValueError(
                "Invalid credentials"
            )

        token = create_access_token(
            {
                "sub": str(user.id),
                "email": user.email,
            }
        )

        return {
            "access_token": token,
            "token_type": "bearer",
        }