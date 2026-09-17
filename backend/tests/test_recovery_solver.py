"""
Unit Tests for SaveSmart Adaptive Recovery Solver
Verifies generation of 3 distinct deterministic recovery paths:
Aggressive, Balanced, Extended Timeline.
"""
from app.engine.cascade import analyze_simulation_results
from app.engine.models import ShockEvent, ShockType
from app.engine.recovery import generate_recovery_plans


def test_generate_recovery_plans_structure(standard_baseline, standard_goal):
    # Apply a 35% income drop shock
    shocks = [
        ShockEvent(
            shock_type=ShockType.INCOME_DROP,
            start_month=3,
            duration_months=4,
            magnitude_percent=0.35
        )
    ]
    _, stressed_summary, _ = analyze_simulation_results(
        standard_baseline,
        standard_goal,
        shocks=shocks,
        horizon_months=36
    )

    plans = generate_recovery_plans(
        standard_baseline,
        standard_goal,
        shocks,
        stressed_summary
    )

    assert len(plans) == 3
    plan_ids = [p.plan_id for p in plans]
    assert "aggressive" in plan_ids
    assert "balanced" in plan_ids
    assert "extended" in plan_ids

    aggressive_plan = next(p for p in plans if p.plan_id == "aggressive")
    balanced_plan = next(p for p in plans if p.plan_id == "balanced")
    extended_plan = next(p for p in plans if p.plan_id == "extended")

    # 1. Aggressive Plan: has largest cut and lowest slippage
    assert aggressive_plan.discretionary_cut_percent >= 0.40
    assert aggressive_plan.discretionary_savings_monthly > 0
    assert aggressive_plan.slippage_months <= balanced_plan.slippage_months

    # 2. Balanced Plan: moderate 25% cut and high feasibility
    assert balanced_plan.discretionary_cut_percent == 0.25
    assert balanced_plan.feasibility_score >= 90.0

    # 3. Extended Plan: 0% cut, highest feasibility, full organic slippage
    assert extended_plan.discretionary_cut_percent == 0.0
    assert extended_plan.discretionary_savings_monthly == 0.0
    assert extended_plan.feasibility_score >= 95.0
    assert extended_plan.slippage_months == stressed_summary.slippage_months
