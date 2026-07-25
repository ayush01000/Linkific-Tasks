from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine
from .routers import transactions

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Savefolio API",
    description="FastAPI backend for the Savefolio expense tracker",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transactions.router)


@app.get("/")
def root():
    return {
        "message": "Savefolio API is running",
        "documentation": "/docs",
    }