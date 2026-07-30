from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy import select, text
from sqlalchemy.orm import Session

import models
import schemas
from database import Base, engine, get_db


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    # Creates the users and tasks tables
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="FastAPI PostgreSQL Project",
    lifespan=lifespan,
)


@app.get("/")
def home():
    return {"message": "FastAPI is running"}


@app.get("/health")
def health(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))

    return {
        "status": "healthy",
        "database": "connected",
    }


@app.post(
    "/users",
    response_model=schemas.UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_user(
    payload: schemas.UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = db.scalar(
        select(models.User).where(
            models.User.email == payload.email
        )
    )

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Email already exists",
        )

    user = models.User(
        name=payload.name,
        email=payload.email,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@app.get(
    "/users",
    response_model=list[schemas.UserResponse],
)
def get_users(db: Session = Depends(get_db)):
    statement = select(models.User).order_by(models.User.id)

    return list(db.scalars(statement).all())


@app.post(
    "/tasks",
    response_model=schemas.TaskResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_task(
    payload: schemas.TaskCreate,
    db: Session = Depends(get_db),
):
    user = db.get(models.User, payload.user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    task = models.Task(
        title=payload.title,
        user_id=payload.user_id,
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


@app.get(
    "/tasks",
    response_model=list[schemas.TaskResponse],
)
def get_tasks(db: Session = Depends(get_db)):
    statement = select(models.Task).order_by(models.Task.id)

    return list(db.scalars(statement).all())