"""
SaveSmart Backend Application
FastAPI ASGI Entrypoint with MongoDB Atlas lifecycle management,
OpenAPI schema documentation, and API Contract error handling.
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_v1_router
from app.core.config import settings
from app.db.mongodb import close_mongo_connection, connect_to_mongo

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("savesmart")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for MongoDB connection."""
    logger.info("Initializing SaveSmart backend...")
    await connect_to_mongo()
    yield
    logger.info("Shutting down SaveSmart backend...")
    await close_mongo_connection()


app = FastAPI(
    title="SaveSmart API",
    version="1.0.0",
    description="Financial resilience and goal stress-testing platform API. Currency: Indian Rupee (INR / ₹).",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Standardized error responses adhering to API_CONTRACT.md."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": "RESOURCE_NOT_FOUND" if exc.status_code == 404 else "HTTP_ERROR",
                "message": str(exc.detail),
                "details": {}
            }
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Standardized validation errors adhering to API_CONTRACT.md."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid request payload",
                "details": {"errors": exc.errors()}
            }
        }
    )


# Mount versioned API routes
app.include_router(api_v1_router, prefix="/api/v1")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=settings.DEBUG)
