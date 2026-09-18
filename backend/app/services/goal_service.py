"""
SaveSmart Goal Service
Bridges Goal API endpoints and repository storage to the deterministic Financial Engine.
Zero financial math performed here: delegates all calculations to backend/app/engine/.
"""
from typing import List, Optional
from app.db.repositories.baseline_repository import baseline_repository
from app.db.repositories.goal_repository import goal_repository
from app.engine.cashflow import compute_required_monthly_contribution
from app.engine.health import evaluate_baseline_goal_health
from app.engine.models import (
    GoalPriority,
    GoalSpec as EngineGoalSpec,
)
from app.schemas.goal import (
    GoalCreateRequest,
    GoalHealthResponse,
    GoalHealthRiskFactorSchema,
    GoalResponse,
    GoalUpdateRequest,
)
from app.schemas.simulation import AssumptionLedgerSchema, ResilienceFingerprintSchema
from app.services.baseline_service import map_dict_to_engine_baseline


def map_dict_to_engine_goal(data: dict) -> EngineGoalSpec:
    """Converts a goal dictionary into the deterministic Financial Engine GoalSpec."""
    priority_str = data.get("priority", "high").lower()
    try:
        priority_enum = GoalPriority(priority_str)
    except ValueError:
        priority_enum = GoalPriority.HIGH

    return EngineGoalSpec(
        goal_id=data.get("id", ""),
        name=data.get("name", ""),
        target_amount=float(data.get("target_amount", 0.0)),
        current_balance=float(data.get("current_balance", 0.0)),
        target_months=int(data.get("target_months", 1)),
        priority=priority_enum,
        category=data.get("category", "general")
    )


class GoalService:
    """Orchestrates Savings Goal operations and queries the deterministic Financial Engine."""

    async def list_user_goals(self, user_id: str) -> List[GoalResponse]:
        goals_data = await goal_repository.get_goals_by_user(user_id)
        responses: List[GoalResponse] = []

        for g in goals_data:
            engine_goal = map_dict_to_engine_goal(g)
            # Delegate contribution math to Financial Engine
            monthly_contrib = compute_required_monthly_contribution(engine_goal)

            responses.append(GoalResponse(
                id=g["id"],
                user_id=g.get("user_id", user_id),
                name=g["name"],
                category=g.get("category", "housing"),
                target_amount=float(g["target_amount"]),
                current_balance=float(g.get("current_balance", 0.0)),
                target_months=int(g["target_months"]),
                priority=g.get("priority", "high"),
                monthly_contribution=monthly_contrib,
                created_at=g.get("created_at", "")
            ))

        return responses

    async def get_goal(self, goal_id: str) -> Optional[GoalResponse]:
        g = await goal_repository.get_goal_by_id(goal_id)
        if not g:
            return None

        engine_goal = map_dict_to_engine_goal(g)
        monthly_contrib = compute_required_monthly_contribution(engine_goal)

        return GoalResponse(
            id=g["id"],
            user_id=g.get("user_id", "demo_user"),
            name=g["name"],
            category=g.get("category", "housing"),
            target_amount=float(g["target_amount"]),
            current_balance=float(g.get("current_balance", 0.0)),
            target_months=int(g["target_months"]),
            priority=g.get("priority", "high"),
            monthly_contribution=monthly_contrib,
            created_at=g.get("created_at", "")
        )

    async def create_goal(self, req: GoalCreateRequest) -> GoalResponse:
        data = req.model_dump()
        created = await goal_repository.create_goal(data)
        engine_goal = map_dict_to_engine_goal(created)
        monthly_contrib = compute_required_monthly_contribution(engine_goal)

        return GoalResponse(
            id=created["id"],
            user_id=created["user_id"],
            name=created["name"],
            category=created["category"],
            target_amount=created["target_amount"],
            current_balance=created["current_balance"],
            target_months=created["target_months"],
            priority=created["priority"],
            monthly_contribution=monthly_contrib,
            created_at=created["created_at"]
        )

    async def update_goal(self, goal_id: str, req: GoalUpdateRequest) -> Optional[GoalResponse]:
        update_dict = {k: v for k, v in req.model_dump().items() if v is not None}
        updated = await goal_repository.update_goal(goal_id, update_dict)
        if not updated:
            return None

        engine_goal = map_dict_to_engine_goal(updated)
        monthly_contrib = compute_required_monthly_contribution(engine_goal)

        return GoalResponse(
            id=updated["id"],
            user_id=updated.get("user_id", "demo_user"),
            name=updated["name"],
            category=updated.get("category", "housing"),
            target_amount=float(updated["target_amount"]),
            current_balance=float(updated.get("current_balance", 0.0)),
            target_months=int(updated["target_months"]),
            priority=updated.get("priority", "high"),
            monthly_contribution=monthly_contrib,
            created_at=updated.get("created_at", "")
        )

    async def delete_goal(self, goal_id: str) -> bool:
        return await goal_repository.delete_goal(goal_id)

    async def get_goal_health(self, goal_id: str) -> Optional[GoalHealthResponse]:
        """
        Computes baseline goal durability and resilience score via Financial Engine.
        """
        goal_doc = await goal_repository.get_goal_by_id(goal_id)
        if not goal_doc:
            return None

        engine_goal = map_dict_to_engine_goal(goal_doc)
        user_id = goal_doc.get("user_id", "demo_user")

        baseline_doc = await baseline_repository.get_baseline_by_user(user_id)
        if not baseline_doc:
            # Fallback baseline profile with zero expenses if not yet configured
            baseline_doc = {
                "user_id": user_id,
                "monthly_net_income": 100000.0,
                "fixed_expenses": {"rent_or_mortgage": 30000.0},
                "discretionary_expenses": {"dining_out": 10000.0},
                "debt_commitments": [],
                "emergency_fund_balance": 50000.0
            }

        engine_baseline = map_dict_to_engine_baseline(baseline_doc)

        # Delegate 100% of health evaluation to Financial Engine
        health_report = evaluate_baseline_goal_health(engine_baseline, engine_goal)

        fp_schema = None
        if health_report.resilience_fingerprint:
            fp = health_report.resilience_fingerprint
            fp_schema = ResilienceFingerprintSchema(
                buffer_strength=fp.buffer_strength,
                cashflow_flexibility=fp.cashflow_flexibility,
                debt_pressure_safety=fp.debt_pressure_safety,
                goal_capacity_cushion=fp.goal_capacity_cushion,
                shock_recovery_velocity=fp.shock_recovery_velocity,
                overall_score=fp.overall_score,
                overall_grade=fp.overall_grade
            )

        c_target = compute_required_monthly_contribution(engine_goal)
        ledger = AssumptionLedgerSchema(
            monthly_net_income=round(engine_baseline.monthly_net_income, 2),
            total_fixed_expenses=round(engine_baseline.fixed_expenses.total, 2),
            total_discretionary_expenses=round(engine_baseline.discretionary_expenses.total, 2),
            total_debt_payments=round(engine_baseline.total_debt_payment, 2),
            emergency_fund_balance=round(engine_baseline.emergency_fund_balance, 2),
            goal_name=engine_goal.name,
            goal_target_amount=round(engine_goal.target_amount, 2),
            goal_initial_balance=round(engine_goal.current_balance, 2),
            goal_target_months=engine_goal.target_months,
            base_monthly_contribution=round(c_target, 2),
            shocks_count=0,
            shocks_applied=[],
            simulation_horizon_months=engine_goal.target_months
        )

        return GoalHealthResponse(
            goal_id=goal_id,
            currency="INR",
            health_status=health_report.health_status,
            baseline_resilience_score=health_report.baseline_resilience_score,
            monthly_savings_rate=health_report.monthly_savings_rate,
            free_cash_flow_margin=health_report.free_cash_flow_margin,
            emergency_buffer_months=health_report.emergency_buffer_months,
            debt_to_income_ratio=health_report.debt_to_income_ratio,
            risk_factors=[
                GoalHealthRiskFactorSchema(
                    factor=rf.factor,
                    severity=rf.severity,
                    description=rf.description
                )
                for rf in health_report.risk_factors
            ],
            resilience_fingerprint=fp_schema,
            assumption_ledger=ledger
        )



goal_service = GoalService()
