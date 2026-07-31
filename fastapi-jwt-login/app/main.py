import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Request, Response, status
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import Base, SessionLocal, engine, get_db
from app.models import User
from app.security import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    get_current_user,
    get_user_from_token,
    hash_password,
    verify_password,
)


load_dotenv()

BASE_DIR = Path(__file__).resolve().parent

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin").lower()
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
COOKIE_SECURE = os.getenv(
    "COOKIE_SECURE",
    "false",
).lower() == "true"


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)

    # Create the initial admin user if it does not exist.
    with SessionLocal() as db:
        existing_user = db.scalar(
            select(User).where(
                User.username == ADMIN_USERNAME
            )
        )

        if existing_user is None:
            user = User(
                username=ADMIN_USERNAME,
                hashed_password=hash_password(ADMIN_PASSWORD),
            )

            db.add(user)
            db.commit()

    yield


app = FastAPI(
    title="FastAPI JWT Login",
    lifespan=lifespan,
)

app.mount(
    "/static",
    StaticFiles(directory=BASE_DIR / "static"),
    name="static",
)

templates = Jinja2Templates(
    directory=BASE_DIR / "templates"
)


@app.get("/")
def home():
    return RedirectResponse(
        url="/login",
        status_code=status.HTTP_303_SEE_OTHER,
    )


@app.get(
    "/login",
    response_class=HTMLResponse,
)
def login_page(
    request: Request,
    db: Annotated[Session, Depends(get_db)],
):
    token = request.cookies.get("access_token")

    if get_user_from_token(token, db):
        return RedirectResponse(
            url="/dashboard",
            status_code=status.HTTP_303_SEE_OTHER,
        )

    return templates.TemplateResponse(
        request=request,
        name="login.html",
    )


@app.post("/token")
def login(
    form: Annotated[
        OAuth2PasswordRequestForm,
        Depends(),
    ],
    db: Annotated[Session, Depends(get_db)],
):
    username = form.username.strip().lower()

    user = db.scalar(
        select(User).where(User.username == username)
    )

    if user is None or not verify_password(
        form.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(user.username)

    response = JSONResponse(
        content={
            "access_token": token,
            "token_type": "bearer",
        }
    )

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )

    return response


@app.get(
    "/dashboard",
    response_class=HTMLResponse,
)
def dashboard(
    request: Request,
    db: Annotated[Session, Depends(get_db)],
):
    token = request.cookies.get("access_token")
    user = get_user_from_token(token, db)

    if user is None:
        return RedirectResponse(
            url="/login",
            status_code=status.HTTP_303_SEE_OTHER,
        )

    return templates.TemplateResponse(
        request=request,
        name="dashboard.html",
        context={"user": user},
    )


@app.get("/me")
def get_profile(
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
):
    return {
        "id": current_user.id,
        "username": current_user.username,
    }


@app.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        path="/",
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
    )

    return {"message": "Logged out successfully"}