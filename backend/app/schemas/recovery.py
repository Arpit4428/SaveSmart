"""
SaveSmart Recovery Schemas
Pydantic models for deterministic recovery plan requests and options in INR (₹).
"""
from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.simulation import ShockEventSchema


class RecoveryPlansRequest(BaseModel):
    goal_id: str = Field(..., description="Goal ID to generate recovery plans for")
    shocks: Optional[List[ShockEventSchema]] = Field(default_factory=list, description="Shocks applied in scenario")
    simulation_id: Optional[str] = Field(default=None, description="Optional simulation run ID")


class RecoveryPlanOption(BaseModel):
    plan_id: str
    name: str
    target_completion_month: int
    slippage_months: int
    discretionary_cut_percent: float
    discretionary_savings_monthly: float
    monthly_contribution_adjusted: float
    emergency_buffer_replenished_month: int
    feasibility_score: float
    description: str


class RecoveryPlansResponse(BaseModel):
    goal_id: str
    simulation_id: str
    currency: str = "INR"
    plans: List[RecoveryPlanOption]
