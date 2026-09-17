"""
SaveSmart Common API Schemas
Generic response envelopes and error definitions.
"""
from typing import Any, Dict, Generic, Optional, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")


class ApiErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Dict[str, Any]] = Field(default_factory=dict)


class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    error: Optional[ApiErrorDetail] = None


class SystemHealthResponse(BaseModel):
    status: str
    version: str
    currency: str = "INR"
    mongodb_connected: bool
    gemini_api_configured: bool
