"""
SaveSmart Stress-Test Controller
Single shock simulation and Cascade sequential shocks.
"""
from fastapi import APIRouter, HTTPException
from app.schemas.common import ApiResponse
from app.schemas.simulation import CascadeShockRequest, SingleShockRequest, SimulationResponse
from app.services.simulation_service import simulation_service

router = APIRouter(prefix="/stress-test", tags=["Stress-Test Lab"])


@router.post("/simulate", response_model=ApiResponse[SimulationResponse])
async def simulate_single_shock(req: SingleShockRequest):
    """
    Simulates a single shock against a savings goal using the deterministic Financial Engine.
    """
    try:
        res = await simulation_service.run_simulation(
            goal_id=req.goal_id,
            shocks=[req.shock],
            horizon_months=req.horizon_months
        )
        return ApiResponse[SimulationResponse](success=True, data=res)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")


@router.post("/cascade", response_model=ApiResponse[SimulationResponse])
async def simulate_cascade_shocks(req: CascadeShockRequest):
    """
    Simulates compound sequential shocks (Cascade Mode) using the deterministic Financial Engine.
    """
    try:
        res = await simulation_service.run_simulation(
            goal_id=req.goal_id,
            shocks=req.shocks,
            horizon_months=req.horizon_months
        )
        return ApiResponse[SimulationResponse](success=True, data=res)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cascade simulation failed: {str(e)}")
