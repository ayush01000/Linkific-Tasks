from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine
from .routers import summary, transactions

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Savefolio V2 API",
    version="2.0.0",
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
app.include_router(summary.router)


@app.get("/")
def root():
    return {
        "message": "Savefolio V2 API is running",
        "documentation": "/docs",
    }