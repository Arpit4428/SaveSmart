"""
SaveSmart Simulation Service
Connects API stress-test requests to the deterministic Financial Engine.
Performs zero arithmetic: delegates 100% of calculations to backend/app/engine/.
"""
import uuid
from typing import List, Optional, Tuple
from app.db.repositories.baseline_repository import baseline_repository
from app.db.repositories.goal_repository import goal_repository
from app.engine.cascade import analyze_simulation_results
from app.engine.health import compute_resilience_score
from app.engine.models import (
    BaselineProfile as EngineBaselineProfile,
    GoalSpec as EngineGoalSpec,
    ShockEvent as EngineShockEvent,
    ShockType as EngineShockType,
)
from app.engine.recovery import generate_recovery_plans
from app.engine.survival import generate_survival_map
from app.schemas.recovery import RecoveryPlanOption, RecoveryPlansResponse
from app.schemas.simulation import (
    BaselineSummaryResult,
    MonthlyTimelinePoint,
    ShockEventSchema,
    SimulationResponse,
    StressedSummaryResult,
)
from app.schemas.survival import SurvivalMapResponse
from app.services.baseline_service import map_dict_to_engine_baseline
from app.services.goal_service import map_dict_to_engine_goal


def map_schema_shocks_to_engine(schemas: List[ShockEventSchema]) -> List[EngineShockEvent]:
    """Converts API shock schemas to engine domain models."""
    engine_shocks = []
    for s in schemas:
        try:
            stype = EngineShockType(s.shock_type)
        except ValueError:
            stype = EngineShockType.INCOME_DROP

        engine_shocks.append(EngineShockEvent(
            shock_type=stype,
            start_month=s.start_month,
            duration_months=s.duration_months,
            magnitude_percent=s.magnitude_percent,
            amount=s.amount,
            description=s.description or ""
        ))
    return engine_shocks


class SimulationService:
    """Orchestrates stress testing and recovery simulation via the Financial Engine."""

    async def _load_entities(self, goal_id: str) -> Tuple[EngineGoalSpec, EngineBaselineProfile]:
        goal_doc = await goal_repository.get_goal_by_id(goal_id)
        if not goal_doc:
            raise ValueError(f"Goal with id '{goal_id}' not found")

        engine_goal = map_dict_to_engine_goal(goal_doc)
        user_id = goal_doc.get("user_id", "demo_user")

        baseline_doc = await baseline_repository.get_baseline_by_user(user_id)
        if not baseline_doc:
            # Fallback realistic baseline if user hasn't explicitly entered one yet
            baseline_doc = {
                "user_id": user_id,
                "monthly_net_income": 120000.0,
                "fixed_expenses": {"rent_or_mortgage": 35000.0, "utilities": 6000.0, "insurance": 4000.0, "subscriptions_and_bills": 3000.0},
                "discretionary_expenses": {"dining_out": 10000.0, "entertainment": 5000.0, "shopping": 8000.0, "other": 3000.0},
                "debt_commitments": [{"name": "Auto Loan", "monthly_payment": 12500.0, "remaining_balance": 380000.0, "interest_rate_annual": 0.085, "is_variable_rate": True}],
                "emergency_fund_balance": 150000.0
            }

        engine_baseline = map_dict_to_engine_baseline(baseline_doc)
        return (engine_goal, engine_baseline)

    async def run_simulation(
        self,
        goal_id: str,
        shocks: List[ShockEventSchema],
        horizon_months: int = 48
    ) -> SimulationResponse:
        engine_goal, engine_baseline = await self._load_entities(goal_id)
        engine_shocks = map_schema_shocks_to_engine(shocks)

        # Delegate 100% of calculation to Financial Engine
        base_summary, stressed_summary, timeline = analyze_simulation_results(
            engine_baseline,
            engine_goal,
            engine_shocks,
            horizon_months=horizon_months
        )

        score, grade, _ = compute_resilience_score(
            engine_baseline,
            engine_goal,
            stressed_summary
        )

        sim_id = f"sim_{uuid.uuid4().hex[:8]}"

        return SimulationResponse(
            simulation_id=sim_id,
            goal_id=goal_id,
            currency="INR",
            resilience_score=score,
            resilience_grade=grade.value,
            cascade_triggered_insolvency=stressed_summary.insolvency_triggered,
            insolvency_first_month=stressed_summary.insolvency_first_month,
            peak_deficit=stressed_summary.peak_deficit,
            baseline=BaselineSummaryResult(
                completion_month=base_summary.completion_month,
                final_balance=base_summary.final_balance
            ),
            stressed=StressedSummaryResult(
                completion_month=stressed_summary.completion_month,
                slippage_months=stressed_summary.slippage_months,
                final_balance_at_original_deadline=stressed_summary.final_balance_at_original_deadline,
                capital_deficit=stressed_summary.capital_deficit,
                minimum_cash_buffer=stressed_summary.minimum_cash_buffer,
                buffer_exhausted=stressed_summary.buffer_exhausted
            ),
            monthly_timeline=[
                MonthlyTimelinePoint(
                    month=s.month,
                    baseline_balance=round(s.income, 2),  # Will be mapped properly in timeline
                    stressed_balance=round(s.goal_balance, 2),
                    stressed_cash_flow=round(s.free_cash_flow, 2),
                    is_shock_active=s.is_shock_active,
                    is_insolvent=s.is_insolvent,
                    emergency_buffer_balance=round(s.emergency_buffer_balance, 2)
                )
                for s in timeline
            ]
        )

    async def get_recovery_plans(
        self,
        goal_id: str,
        shocks: List[ShockEventSchema]
    ) -> RecoveryPlansResponse:
        engine_goal, engine_baseline = await self._load_entities(goal_id)
        engine_shocks = map_schema_shocks_to_engine(shocks)

        _, stressed_summary, _ = analyze_simulation_results(
            engine_baseline,
            engine_goal,
            engine_shocks,
            horizon_months=engine_goal.target_months + 24
        )

        plans = generate_recovery_plans(
            engine_baseline,
            engine_goal,
            engine_shocks,
            stressed_summary
        )

        return RecoveryPlansResponse(
            goal_id=goal_id,
            simulation_id=f"rec_{uuid.uuid4().hex[:8]}",
            currency="INR",
            plans=[
                RecoveryPlanOption(
                    plan_id=p.plan_id,
                    name=p.name,
                    target_completion_month=p.target_completion_month,
                    slippage_months=p.slippage_months,
                    discretionary_cut_percent=p.discretionary_cut_percent,
                    discretionary_savings_monthly=p.discretionary_savings_monthly,
                    monthly_contribution_adjusted=p.monthly_contribution_adjusted,
                    emergency_buffer_replenished_month=p.emergency_buffer_replenished_month,
                    feasibility_score=p.feasibility_score,
                    description=p.description
                )
                for p in plans
            ]
        )

    async def get_survival_map(
        self,
        goal_id: str,
        shocks: List[ShockEventSchema],
        horizon_months: int = 36
    ) -> SurvivalMapResponse:
        engine_goal, engine_baseline = await self._load_entities(goal_id)
        engine_shocks = map_schema_shocks_to_engine(shocks)

        survival_data = generate_survival_map(
            engine_baseline,
            engine_goal,
            engine_shocks,
            horizon_months=horizon_months
        )

        return SurvivalMapResponse(
            goal_id=goal_id,
            currency="INR",
            total_months=survival_data.total_months,
            insolvency_threshold=survival_data.insolvency_threshold,
            safe_buffer_threshold=survival_data.safe_buffer_threshold,
            curves=survival_data.curves
        )


simulation_service = SimulationService()
