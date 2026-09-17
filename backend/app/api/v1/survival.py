"""
SaveSmart Survival Map Controller
Generates coordinate trajectories for the Goal Survival Map.
"""
from fastapi import APIRouter, HTTPException
from app.schemas.common import ApiResponse
from app.schemas.survival import SurvivalMapRequest, SurvivalMapResponse
from app.services.simulation_service import simulation_service

router = APIRouter(prefix="/survival", tags=["Survival Map"])


@router.post("/map", response_model=ApiResponse[SurvivalMapResponse])
async def get_survival_map(req: SurvivalMapRequest):
    """
    Constructs multi-scenario comparative curves (baseline, stressed, recovered)
    via the deterministic Financial Engine.
    """
    try:
        map_res = await simulation_service.get_survival_map(
            goal_id=req.goal_id,
            shocks=req.shocks or [],
            horizon_months=req.horizon_months
        )
        return ApiResponse[SurvivalMapResponse](success=True, data=map_res)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Survival map generator failed: {str(e)}")
