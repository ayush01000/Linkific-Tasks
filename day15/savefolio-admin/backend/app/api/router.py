from fastapi import APIRouter

from app.api.routes import (
    admin,
    auth,
    dashboard,
    health,
    transactions,
)


api_router = APIRouter()

api_router.include_router(
    health.router,
    prefix="/health",
    tags=["Health"],
)

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"],
)

api_router.include_router(
    transactions.router,
    prefix="/transactions",
    tags=["Transactions"],
)

api_router.include_router(
    dashboard.router,
    prefix="/dashboard",
    tags=["Dashboard"],
)

api_router.include_router(
    admin.router,
    prefix="/admin",
    tags=["Administration"],
)
