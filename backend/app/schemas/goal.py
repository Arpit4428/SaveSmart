"""
SaveSmart Goal Schemas
Pydantic schemas for Savings Goal requests and responses in INR (₹).
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class GoalCreateRequest(BaseModel):
    user_id: str = Field(default="demo_user", description="Owner user ID")
    name: str = Field(..., min_length=2, max_length=100, description="Name of the savings goal")
    category: str = Field(default="housing", description="Category: housing, emergency, vehicle, etc.")
    target_amount: float = Field(..., gt=0, description="Target savings amount in INR (₹)")
    current_balance: float = Field(default=0.0, ge=0, description="Current accumulated savings in INR (₹)")
    target_months: int = Field(..., gt=0, le=360, description="Target timeframe in months")
    priority: str = Field(default="high", description="Priority: low, medium, high")


class GoalUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    category: Optional[str] = None
    target_amount: Optional[float] = Field(None, gt=0)
    current_balance: Optional[float] = Field(None, ge=0)
    target_months: Optional[int] = Field(None, gt=0, le=360)
    priority: Optional[str] = None


class GoalResponse(BaseModel):
    id: str
    user_id: str
    name: str
    category: str
    target_amount: float
    current_balance: float
    target_months: int
    priority: str
    monthly_contribution: float
    created_at: str


class GoalHealthRiskFactorSchema(BaseModel):
    factor: str
    severity: str
    description: str


class GoalHealthResponse(BaseModel):
    goal_id: str
    currency: str = "INR"
    health_status: str
    baseline_resilience_score: float
    monthly_savings_rate: float
    free_cash_flow_margin: float
    emergency_buffer_months: float
    debt_to_income_ratio: float
    risk_factors: List[GoalHealthRiskFactorSchema] = Field(default_factory=list)
