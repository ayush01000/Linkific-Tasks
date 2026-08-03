from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)
from sqlalchemy.orm import Session

from app.core.security import (
    TokenValidationError,
    decode_access_token,
)
from app.db.session import get_db
from app.models.user import User


bearer_scheme = HTTPBearer(auto_error=False)

DatabaseDependency = Annotated[Session, Depends(get_db)]


def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ],
    database: DatabaseDependency,
) -> User:
    authentication_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication is required.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise authentication_error

    try:
        user_id = decode_access_token(credentials.credentials)
    except TokenValidationError:
        raise authentication_error

    user = database.get(User, user_id)

    if user is None:
        raise authentication_error

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been disabled.",
        )

    return user


CurrentUserDependency = Annotated[
    User,
    Depends(get_current_user),
]


def get_current_admin(
    current_user: CurrentUserDependency,
) -> User:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access is required.",
        )

    return current_user


CurrentAdminDependency = Annotated[
    User,
    Depends(get_current_admin),
]
