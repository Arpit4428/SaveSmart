"""
SaveSmart Goal Survival Map Schemas
Pydantic models for survival map curves and threshold parameters in INR (₹).
"""
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from app.schemas.simulation import ShockEventSchema


class SurvivalMapRequest(BaseModel):
    goal_id: str = Field(..., description="Goal ID to generate survival map for")
    shocks: Optional[List[ShockEventSchema]] = Field(default_factory=list, description="Shocks applied in scenario")
    horizon_months: int = Field(default=36, ge=12, le=120, description="Timeline horizon in months")


class SurvivalMapResponse(BaseModel):
    goal_id: str
    currency: str = "INR"
    total_months: int
    insolvency_threshold: float
    safe_buffer_threshold: float
    curves: Dict[str, List[float]]
