"""
SaveSmart Financial Baseline Controller
Profile management for income, expenses, debts, and emergency funds.
"""
from fastapi import APIRouter, HTTPException, Query
from app.schemas.baseline import BaselineProfileRequest, BaselineProfileResponse
from app.schemas.common import ApiResponse
from app.services.baseline_service import baseline_service

router = APIRouter(prefix="/baseline", tags=["Baseline"])


@router.get("", response_model=ApiResponse[BaselineProfileResponse])
async def get_financial_baseline(user_id: str = Query("demo_user", description="User ID")):
    """
    Retrieves the user's financial profile with deterministic engine summaries
    (free cash flow, fixed/discretionary totals, savings capacity %).
    """
    profile = await baseline_service.get_user_baseline(user_id)
    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Financial baseline profile not found for this user"
        )
    return ApiResponse[BaselineProfileResponse](success=True, data=profile)


@router.post("", response_model=ApiResponse[BaselineProfileResponse])
async def save_financial_baseline(req: BaselineProfileRequest):
    """
    Creates or updates the user's financial baseline profile.
    Deterministic summaries calculated strictly via the Financial Engine.
    """
    saved = await baseline_service.save_user_baseline(req)
    return ApiResponse[BaselineProfileResponse](success=True, data=saved)
