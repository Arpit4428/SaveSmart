"""
Pydantic schemas for the SaveSmart Gemini Explanation Layer.
"""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.schemas.simulation import ShockEventSchema


class ScenarioExplanationRequest(BaseModel):
    """
    Request to explain a deterministic simulation or health report.
    The backend computes or retrieves the verified financial calculation.
    Arbitrary user-provided financial figures are not accepted.
    """
    goal_id: str = Field(..., description="ID of the registered goal to analyze")
    explanation_type: str = Field(
        default="stress_test",
        description="Type of analysis: 'health', 'stress_test', 'cascade', 'recovery', 'survival'"
    )
    shocks: Optional[List[ShockEventSchema]] = Field(
        default=None,
        description="Optional shock events for stress-test, cascade, recovery, or survival explanations"
    )
    horizon_months: Optional[int] = Field(
        default=36,
        description="Simulation projection horizon in months"
    )
    question: Optional[str] = Field(
        default=None,
        description="Specific question e.g. 'Why did my goal become fragile?' or 'Explain my Goal Survival Map'"
    )


class AIExplanationStructured(BaseModel):
    """
    Strictly structured AI explanation schema.
    """
    headline: str = Field(
        ...,
        description="1-sentence analytical summary of the primary financial dynamic"
    )
    summary: str = Field(
        ...,
        description="Empathetic, plain-language narrative explaining verified engine dynamics"
    )
    key_drivers: List[str] = Field(
        ...,
        description="Bulleted breakdown of primary financial drivers derived from verified data"
    )
    impact_assessment: str = Field(
        ...,
        description="Explanation of buffer absorption, slippage, or shortfall without altering numbers"
    )
    trade_offs_explained: Optional[str] = Field(
        default=None,
        description="Explanation of recovery or lifestyle sacrifices if applicable"
    )
    actionable_next_steps: List[str] = Field(
        ...,
        description="Pragmatic budgeting and resilience steps (strictly NO investment/asset advice)"
    )


class ScenarioExplanationResponse(BaseModel):
    """
    Complete response payload separating verified math from AI explanation.
    """
    goal_id: str
    explanation_type: str
    currency: str = "INR"
    verified_financial_result: Dict[str, Any] = Field(
        ...,
        description="100% deterministic Python calculation results (single source of truth)"
    )
    ai_explanation: AIExplanationStructured = Field(
        ...,
        description="Validated natural-language explanation of verified results"
    )
    is_fallback: bool = Field(
        default=False,
        description="True if explanation was generated via deterministic fallback engine"
    )
    model_used: Optional[str] = Field(
        default=None,
        description="Model identifier if generated via Gemini, or 'deterministic_engine' if fallback"
    )
    disclaimer: str = Field(
        default="Financial calculations are computed deterministically by SaveSmart's Python Financial Engine. AI only explains verified results and does not provide financial or investment advice."
    )
