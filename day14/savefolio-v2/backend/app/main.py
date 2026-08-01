import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.api.router import api_router
from app.core.config import get_settings


settings = get_settings()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("savefolio")

app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=False,
    allow_methods=[
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],
    allow_headers=[
        "Authorization",
        "Content-Type",
    ],
)

app.include_router(
    api_router,
    prefix=settings.api_v1_prefix,
)


@app.get("/", include_in_schema=False)
def root() -> dict[str, str]:
    return {
        "message": "Savefolio API is running.",
        "docs": "/docs",
    }


@app.exception_handler(HTTPException)
async def http_exception_handler(
    request: Request,
    exception: HTTPException,
) -> JSONResponse:
    return JSONResponse(
        status_code=exception.status_code,
        headers=exception.headers,
        content={"message": exception.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exception: RequestValidationError,
) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content=jsonable_encoder(
            {
                "message": "Please check the submitted information.",
                "errors": exception.errors(),
            }
        ),
    )


@app.exception_handler(SQLAlchemyError)
async def database_exception_handler(
    request: Request,
    exception: SQLAlchemyError,
) -> JSONResponse:
    logger.exception("Database error: %s", exception)

    return JSONResponse(
        status_code=500,
        content={
            "message": "A database error occurred."
        },
    )


@app.exception_handler(Exception)
async def unexpected_exception_handler(
    request: Request,
    exception: Exception,
) -> JSONResponse:
    logger.exception("Unexpected error: %s", exception)

    return JSONResponse(
        status_code=500,
        content={
            "message": "An unexpected server error occurred."
        },
    )