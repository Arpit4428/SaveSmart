"""
SaveSmart Simulation Schemas
Pydantic models for stress-testing and cascade shocks in INR (₹).
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class ShockEventSchema(BaseModel):
    shock_type: str = Field(..., description="income_drop, lump_sum_expense, inflation_spike, interest_rate_hike")
    start_month: int = Field(..., ge=1, description="1-indexed month when shock begins")
    duration_months: int = Field(default=1, ge=1, description="Duration in months")
    magnitude_percent: float = Field(default=0.0, ge=0.0, description="Magnitude as fraction or decimal (e.g. 0.35)")
    amount: float = Field(default=0.0, ge=0.0, description="Lump sum expense amount in INR (₹)")
    description: Optional[str] = Field(default="", description="Description of the shock event")


class SingleShockRequest(BaseModel):
    goal_id: str = Field(..., description="Goal ID to stress-test")
    shock: ShockEventSchema = Field(..., description="Shock parameters to apply")
    horizon_months: int = Field(default=48, ge=6, le=120, description="Projection horizon in months")


class CascadeShockRequest(BaseModel):
    goal_id: str = Field(..., description="Goal ID to stress-test")
    sequence_name: Optional[str] = Field(default="Cascade Sequence", description="Name of the scenario")
    shocks: List[ShockEventSchema] = Field(..., min_length=1, description="Sequential compound shocks")
    horizon_months: int = Field(default=48, ge=6, le=120, description="Projection horizon in months")


class MonthlyTimelinePoint(BaseModel):
    month: int
    baseline_balance: float
    stressed_balance: float
    stressed_cash_flow: float
    is_shock_active: bool
    is_insolvent: bool = False
    emergency_buffer_balance: float = 0.0


class BaselineSummaryResult(BaseModel):
    completion_month: Optional[int]
    final_balance: float


class StressedSummaryResult(BaseModel):
    completion_month: Optional[int]
    slippage_months: int
    final_balance_at_original_deadline: float
    capital_deficit: float
    minimum_cash_buffer: float
    buffer_exhausted: bool


class SimulationResponse(BaseModel):
    simulation_id: str
    goal_id: str
    currency: str = "INR"
    resilience_score: float
    resilience_grade: str
    cascade_triggered_insolvency: bool = False
    insolvency_first_month: Optional[int] = None
    peak_deficit: float = 0.0
    baseline: BaselineSummaryResult
    stressed: StressedSummaryResult
    monthly_timeline: List[MonthlyTimelinePoint]
