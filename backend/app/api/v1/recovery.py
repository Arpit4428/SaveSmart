"""
SaveSmart Adaptive Recovery Controller
Generates 3 deterministic recovery plans to counteract applied shocks.
"""
from fastapi import APIRouter, HTTPException
from app.schemas.common import ApiResponse
from app.schemas.recovery import RecoveryPlansRequest, RecoveryPlansResponse
from app.services.simulation_service import simulation_service

router = APIRouter(prefix="/recovery", tags=["Recovery Planner"])


@router.post("/plans", response_model=ApiResponse[RecoveryPlansResponse])
async def get_recovery_plans(req: RecoveryPlansRequest):
    """
    Solves for Aggressive, Balanced, and Extended Timeline recovery plans
    via the deterministic Financial Engine.
    """
    try:
        plans_res = await simulation_service.get_recovery_plans(
            goal_id=req.goal_id,
            shocks=req.shocks or []
        )
        return ApiResponse[RecoveryPlansResponse](success=True, data=plans_res)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recovery solver failed: {str(e)}")
