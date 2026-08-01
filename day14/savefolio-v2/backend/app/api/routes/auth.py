from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.api.dependencies import (
    CurrentUserDependency,
    DatabaseDependency,
)
from app.core.security import (
    DUMMY_PASSWORD_HASH,
    create_access_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
    UserRead,
    UserRegister,
)


router = APIRouter()


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    payload: UserRegister,
    database: DatabaseDependency,
) -> User:
    existing_user = database.scalar(
        select(User).where(User.email == payload.email)
    )

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )

    database.add(user)

    try:
        database.commit()
    except IntegrityError:
        database.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    database.refresh(user)
    return user


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login_user(
    payload: LoginRequest,
    database: DatabaseDependency,
) -> TokenResponse:
    user = database.scalar(
        select(User).where(User.email == payload.email)
    )

    if user is None:
        verify_password(
            payload.password,
            DUMMY_PASSWORD_HASH,
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not verify_password(
        payload.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    return TokenResponse(
        access_token=create_access_token(user.id),
        user=UserRead.model_validate(user),
    )


@router.get(
    "/me",
    response_model=UserRead,
)
def get_authenticated_user(
    current_user: CurrentUserDependency,
) -> User:
    return current_user