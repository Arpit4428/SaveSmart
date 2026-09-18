"""
SaveSmart AI Explanation Endpoint.
POST /api/v1/explain/scenario
Produces natural language explanations of verified deterministic engine results.
"""
from typing import Any, Dict
from fastapi import APIRouter, HTTPException, status

from app.schemas.common import ApiResponse
from app.schemas.explanation import (
    ScenarioExplanationRequest,
    ScenarioExplanationResponse,
)
from app.schemas.simulation import ShockEventSchema
from app.services.baseline_service import baseline_service
from app.services.gemini_service import gemini_service
from app.services.goal_service import goal_service
from app.services.simulation_service import simulation_service

router = APIRouter(prefix="/explain", tags=["AI Explanation Layer"])


@router.post(
    "/scenario",
    response_model=ApiResponse[ScenarioExplanationResponse],
    status_code=status.HTTP_200_OK,
    summary="Generate a natural language explanation of verified financial results",
)
async def explain_scenario_endpoint(
    req: ScenarioExplanationRequest,
):
    """
    Explains verified deterministic calculations.
    Runs or retrieves verified engine outputs and submits them to Gemini or the Fallback Explainer.
    All financial numbers are strictly preserved.
    """
    # 1. Verify Goal exists
    goal = await goal_service.get_goal(req.goal_id)
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Goal with id '{req.goal_id}' not found.",
        )

    # 2. Verify Baseline exists
    baseline = await baseline_service.get_user_baseline(goal.user_id)
    if not baseline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Financial baseline profile for user '{goal.user_id}' not found.",
        )

    explanation_type = req.explanation_type.lower()
    verified_result: Dict[str, Any] = {}

    # 3. Execute deterministic engine calculation to produce single source of truth
    try:
        if explanation_type == "health":
            health_report = await goal_service.get_goal_health(req.goal_id)
            if not health_report:
                raise ValueError(f"Unable to calculate goal health for goal '{req.goal_id}'")
            verified_result = health_report.model_dump()

        elif explanation_type == "cascade":
            shocks = req.shocks or [
                ShockEventSchema(
                    shock_type="income_drop",
                    start_month=2,
                    duration_months=3,
                    magnitude_percent=0.40,
                    description="Job loss and contract gap",
                ),
                ShockEventSchema(
                    shock_type="lump_sum_expense",
                    start_month=4,
                    amount=150000.0,
                    description="Medical hospitalization co-pay",
                ),
            ]
            sim_res = await simulation_service.run_simulation(
                req.goal_id, shocks, req.horizon_months or 36
            )
            verified_result = sim_res.model_dump()

        elif explanation_type == "recovery":
            shocks = req.shocks or [
                ShockEventSchema(
                    shock_type="income_drop",
                    start_month=2,
                    duration_months=3,
                    magnitude_percent=0.35,
                    description="Income contraction",
                )
            ]
            rec_res = await simulation_service.get_recovery_plans(
                goal_id=req.goal_id, shocks=shocks
            )
            verified_result = rec_res.model_dump()

        elif explanation_type == "survival":
            shocks = req.shocks or [
                ShockEventSchema(
                    shock_type="income_drop",
                    start_month=2,
                    duration_months=4,
                    magnitude_percent=0.35,
                    description="Prolonged income disruption",
                )
            ]
            surv_res = await simulation_service.get_survival_map(
                goal_id=req.goal_id, shocks=shocks, horizon_months=req.horizon_months or 36
            )
            verified_result = surv_res.model_dump()

        else:
            # Default to single shock stress test
            shock = (req.shocks and req.shocks[0]) or ShockEventSchema(
                shock_type="income_drop",
                start_month=3,
                duration_months=4,
                magnitude_percent=0.35,
                description="Salary reduction",
            )
            sim_res = await simulation_service.run_simulation(
                req.goal_id, [shock], req.horizon_months or 36
            )
            verified_result = sim_res.model_dump()

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Financial engine calculation error: {str(exc)}",
        )

    # 4. Generate AI explanation from verified results
    ai_explanation, is_fallback, model_used = await gemini_service.explain_scenario(
        explanation_type=explanation_type,
        verified_context=verified_result,
        custom_question=req.question,
    )

    response_data = ScenarioExplanationResponse(
        goal_id=req.goal_id,
        explanation_type=explanation_type,
        currency="INR",
        verified_financial_result=verified_result,
        ai_explanation=ai_explanation,
        is_fallback=is_fallback,
        model_used=model_used,
        disclaimer=(
            "Financial calculations are computed deterministically by SaveSmart's Python Financial Engine. "
            "AI only explains verified results and does not provide financial or investment advice."
        ),
    )

    return ApiResponse(data=response_data)
