"""
SaveSmart Simulation Service
Connects API stress-test requests to the deterministic Financial Engine.
Performs zero arithmetic: delegates 100% of calculations to backend/app/engine/.
"""
import uuid
from typing import List, Optional, Tuple
from app.db.repositories.baseline_repository import baseline_repository
from app.db.repositories.goal_repository import goal_repository
from app.engine.cashflow import compute_required_monthly_contribution, project_baseline_trajectory
from app.engine.cascade import analyze_simulation_results, generate_chain_reaction_steps
from app.engine.health import (
    compute_resilience_fingerprint,
    compute_resilience_score,
    diagnose_goal_failure,
)
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
    AssumptionLedgerSchema,
    BaselineSummaryResult,
    ChainReactionStepSchema,
    FailureDiagnosticSchema,
    MonthlyTimelinePoint,
    ResilienceFingerprintSchema,
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


def build_assumption_ledger(
    baseline: EngineBaselineProfile,
    goal: EngineGoalSpec,
    shocks: List[EngineShockEvent],
    horizon: int
) -> AssumptionLedgerSchema:
    c_target = compute_required_monthly_contribution(goal)
    return AssumptionLedgerSchema(
        monthly_net_income=round(baseline.monthly_net_income, 2),
        total_fixed_expenses=round(baseline.fixed_expenses.total, 2),
        total_discretionary_expenses=round(baseline.discretionary_expenses.total, 2),
        total_debt_payments=round(baseline.total_debt_payment, 2),
        emergency_fund_balance=round(baseline.emergency_fund_balance, 2),
        goal_name=goal.name,
        goal_target_amount=round(goal.target_amount, 2),
        goal_initial_balance=round(goal.current_balance, 2),
        goal_target_months=goal.target_months,
        base_monthly_contribution=round(c_target, 2),
        shocks_count=len(shocks),
        shocks_applied=[
            {
                "shock_type": s.shock_type.value,
                "start_month": s.start_month,
                "duration_months": s.duration_months,
                "magnitude_percent": s.magnitude_percent,
                "amount": s.amount,
                "description": s.description
            }
            for s in shocks
        ],
        simulation_horizon_months=horizon
    )


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

        # 1. Baseline trajectory for chart comparison
        baseline_snaps = project_baseline_trajectory(engine_baseline, engine_goal, horizon_months=horizon_months)

        # 2. Delegate 100% of calculation to Financial Engine
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

        # 3. Chain Reaction Steps
        chain_steps = generate_chain_reaction_steps(
            engine_baseline,
            engine_goal,
            engine_shocks,
            timeline,
            stressed_summary
        )

        # 4. Failure Diagnostic
        failure_diag = diagnose_goal_failure(
            engine_baseline,
            engine_goal,
            engine_shocks,
            stressed_summary,
            timeline
        )

        # 5. Resilience Fingerprint
        fingerprint = compute_resilience_fingerprint(
            engine_baseline,
            engine_goal,
            min_buffer_balance=stressed_summary.minimum_cash_buffer,
            slippage_months=stressed_summary.slippage_months,
            insolvency_triggered=stressed_summary.insolvency_triggered
        )

        # 6. Assumption Ledger
        assumption_ledger = build_assumption_ledger(
            engine_baseline,
            engine_goal,
            engine_shocks,
            horizon_months
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
                    baseline_balance=round(baseline_snaps[idx].goal_balance, 2) if idx < len(baseline_snaps) else 0.0,
                    stressed_balance=round(s.goal_balance, 2),
                    stressed_cash_flow=round(s.free_cash_flow, 2),
                    is_shock_active=s.is_shock_active,
                    is_insolvent=s.is_insolvent,
                    emergency_buffer_balance=round(s.emergency_buffer_balance, 2)
                )
                for idx, s in enumerate(timeline)
            ],
            chain_reaction_steps=[
                ChainReactionStepSchema(
                    step_number=cs.step_number,
                    title=cs.title,
                    timing=cs.timing,
                    shock_type=cs.shock_type,
                    monthly_cashflow_impact=cs.monthly_cashflow_impact,
                    remaining_buffer=cs.remaining_buffer,
                    monthly_contribution_change=cs.monthly_contribution_change,
                    goal_impact_description=cs.goal_impact_description,
                    cumulative_delay_added=cs.cumulative_delay_added,
                    is_critical=cs.is_critical
                )
                for cs in chain_steps
            ],
            failure_diagnostic=FailureDiagnosticSchema(
                headline=failure_diag.headline,
                root_causes=failure_diag.root_causes,
                primary_vulnerability=failure_diag.primary_vulnerability,
                contribution_drop_monthly=failure_diag.contribution_drop_monthly,
                cashflow_drop_monthly=failure_diag.cashflow_drop_monthly,
                buffer_absorbed_total=failure_diag.buffer_absorbed_total,
                deadline_slippage_months=failure_diag.deadline_slippage_months,
                capital_loss_at_deadline=failure_diag.capital_loss_at_deadline
            ),
            assumption_ledger=assumption_ledger,
            resilience_fingerprint=ResilienceFingerprintSchema(
                buffer_strength=fingerprint.buffer_strength,
                cashflow_flexibility=fingerprint.cashflow_flexibility,
                debt_pressure_safety=fingerprint.debt_pressure_safety,
                goal_capacity_cushion=fingerprint.goal_capacity_cushion,
                shock_recovery_velocity=fingerprint.shock_recovery_velocity,
                overall_score=fingerprint.overall_score,
                overall_grade=fingerprint.overall_grade
            )
        )

    async def get_recovery_plans(
        self,
        goal_id: str,
        shocks: List[ShockEventSchema]
    ) -> RecoveryPlansResponse:
        engine_goal, engine_baseline = await self._load_entities(goal_id)
        engine_shocks = map_schema_shocks_to_engine(shocks)
        horizon = max(48, engine_goal.target_months + 24)

        _, stressed_summary, stressed_snaps = analyze_simulation_results(
            engine_baseline,
            engine_goal,
            engine_shocks,
            horizon_months=horizon
        )

        plans = generate_recovery_plans(
            engine_baseline,
            engine_goal,
            engine_shocks,
            stressed_summary
        )

        curves = {
            p.plan_id: p.trajectory_curve
            for p in plans
        }
        curves["stressed"] = [engine_goal.current_balance] + [s.goal_balance for s in stressed_snaps]

        assumption_ledger = build_assumption_ledger(
            engine_baseline,
            engine_goal,
            engine_shocks,
            horizon
        )

        return RecoveryPlansResponse(
            goal_id=goal_id,
            simulation_id=f"rec_{uuid.uuid4().hex[:8]}",
            currency="INR",
            target_amount=round(engine_goal.target_amount, 2),
            target_deadline_months=engine_goal.target_months,
            curves=curves,
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
                    description=p.description,
                    buffer_preserved=p.buffer_preserved,
                    time_to_recover_months=p.time_to_recover_months,
                    pros=p.pros,
                    cons=p.cons,
                    trade_offs=p.trade_offs,
                    trajectory_curve=p.trajectory_curve
                )
                for p in plans
            ],
            assumption_ledger=assumption_ledger.model_dump()
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

        assumption_ledger = build_assumption_ledger(
            engine_baseline,
            engine_goal,
            engine_shocks,
            horizon_months
        )

        return SurvivalMapResponse(
            goal_id=goal_id,
            currency="INR",
            total_months=survival_data.total_months,
            insolvency_threshold=survival_data.insolvency_threshold,
            safe_buffer_threshold=survival_data.safe_buffer_threshold,
            curves=survival_data.curves,
            target_amount=survival_data.target_amount,
            target_deadline_months=survival_data.target_deadline_months,
            first_unsafe_month=survival_data.first_unsafe_month,
            max_drawdown=survival_data.max_drawdown,
            deadline_slippage=survival_data.deadline_slippage,
            capital_shortfall=survival_data.capital_shortfall,
            recovery_point_month=survival_data.recovery_point_month,
            final_status=survival_data.final_status,
            survival_verdict=survival_data.survival_verdict,
            buffer_curves=survival_data.buffer_curves,
            assumption_ledger=assumption_ledger.model_dump()
        )



simulation_service = SimulationService()
