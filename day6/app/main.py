from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.products import router as products_router


app = FastAPI(
    title="Inventory Management API",
    version="1.0.0",
    description="A beginner-friendly FastAPI CRUD project.",
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

app.include_router(products_router)


@app.get("/", tags=["General"])
def home() -> dict[str, str]:
    return {"name": "Ayush"}
    
    

@app.get("/health", tags=["General"])
def health_check() -> dict[str, str]:
    return {"status": "healthy"}

