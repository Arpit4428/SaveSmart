"""
SaveSmart System Health Controller
"""
from fastapi import APIRouter
from app.core.config import settings
from app.db.mongodb import ping_database
from app.schemas.common import SystemHealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=SystemHealthResponse)
async def get_system_health():
    """
    Returns API operational status, database connectivity, and configuration flags.
    """
    db_connected = await ping_database()
    gemini_configured = bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip())

    return SystemHealthResponse(
        status="healthy",
        version="1.0.0",
        currency=settings.CURRENCY,
        mongodb_connected=db_connected,
        gemini_api_configured=gemini_configured
    )
