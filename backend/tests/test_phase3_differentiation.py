"""
SaveSmart Phase 3 Differentiation Feature Tests
Unit and integration tests for:
- Goal Survival Map (unsafe months, drawdown, verdict, recovery point)
- Cascade Mode Financial Chain Reaction sequence
- Recovery Path Simulator (3 trajectories, trade-offs, buffer preserved)
- 'Why Did My Goal Fail?' Diagnostic analysis
- Assumption Ledger transparency
- 5-Axis Financial Resilience Fingerprint
"""
import pytest
from app.engine.models import (
    BaselineProfile,
    GoalPriority,
    GoalSpec,
    ShockEvent,
    ShockType,
)
from app.engine.cashflow import compute_required_monthly_contribution
from app.engine.cascade import (
    analyze_simulation_results,
    generate_chain_reaction_steps,
    simulate_cascade_progression,
)
from app.engine.health import (
    compute_resilience_fingerprint,
    diagnose_goal_failure,
    evaluate_baseline_goal_health,
)
from app.engine.recovery import generate_recovery_plans
from app.engine.survival import generate_survival_map


def test_resilience_fingerprint_dimensions(standard_baseline, standard_goal):
    """Verifies that all 5 fingerprint axes are bounded between 0 and 100."""
    fp = compute_resilience_fingerprint(standard_baseline, standard_goal)
    assert 0.0 <= fp.buffer_strength <= 100.0
    assert 0.0 <= fp.cashflow_flexibility <= 100.0
    assert 0.0 <= fp.debt_pressure_safety <= 100.0
    assert 0.0 <= fp.goal_capacity_cushion <= 100.0
    assert 0.0 <= fp.shock_recovery_velocity <= 100.0
    assert 0.0 <= fp.overall_score <= 100.0
    assert fp.overall_grade in ["ROBUST", "MODERATE", "VULNERABLE", "CRITICAL"]


def test_failure_diagnostic_rule_driven(standard_baseline, standard_goal):
    """Verifies deterministic root cause extraction without AI hallucinations."""
    shocks = [
        ShockEvent(
            shock_type=ShockType.INCOME_DROP,
            start_month=2,
            duration_months=4,
            magnitude_percent=0.40,
            description="40% Income Cut"
        )
    ]
    _, stressed_summary, snaps = analyze_simulation_results(
        standard_baseline, standard_goal, shocks, horizon_months=36
    )
    diag = diagnose_goal_failure(standard_baseline, standard_goal, shocks, stressed_summary, snaps)

    assert "WHY YOUR GOAL" in diag.headline
    assert len(diag.root_causes) == 5
    assert diag.primary_vulnerability is not None
    assert diag.cashflow_drop_monthly > 0
    assert diag.contribution_drop_monthly >= 0
    assert diag.buffer_absorbed_total >= 0


def test_chain_reaction_step_sequencing(standard_baseline, standard_goal):
    """Verifies step-by-step chain reaction generation for multiple shocks."""
    shocks = [
        ShockEvent(
            shock_type=ShockType.INCOME_DROP,
            start_month=2,
            duration_months=3,
            magnitude_percent=0.30,
            description="Salary Reduction"
        ),
        ShockEvent(
            shock_type=ShockType.LUMP_SUM_EXPENSE,
            start_month=5,
            duration_months=1,
            amount=60000.0,
            description="Medical Emergency"
        )
    ]
    _, stressed_summary, snaps = analyze_simulation_results(
        standard_baseline, standard_goal, shocks, horizon_months=36
    )
    steps = generate_chain_reaction_steps(standard_baseline, standard_goal, shocks, snaps, stressed_summary)

    # Initial state + 2 shocks + Compounded Outcome = 4 steps
    assert len(steps) == 4
    assert steps[0].title == "Initial Financial Equilibrium"
    assert steps[1].shock_type == "income_drop"
    assert steps[2].shock_type == "lump_sum_expense"
    assert steps[3].title == "Compounded Systemic Outcome"
    assert all(step.goal_impact_description for step in steps)


def test_upgraded_survival_map_analytics(standard_baseline, standard_goal):
    """Verifies analytical metrics computed on Goal Survival Map."""
    shocks = [
        ShockEvent(
            shock_type=ShockType.INCOME_DROP,
            start_month=2,
            duration_months=5,
            magnitude_percent=0.35,
            description="Prolonged Job Disruption"
        )
    ]
    smap = generate_survival_map(standard_baseline, standard_goal, shocks, horizon_months=36)

    assert smap.target_amount == standard_goal.target_amount
    assert smap.target_deadline_months == standard_goal.target_months
    assert smap.deadline_slippage >= 0
    assert smap.capital_shortfall >= 0
    assert smap.max_drawdown >= 0
    assert smap.final_status in ["SURVIVED", "DELAYED", "CRITICAL"]
    assert len(smap.survival_verdict) > 20
    assert "baseline" in smap.curves
    assert "stressed" in smap.curves
    assert "recovered_balanced" in smap.curves
    assert "baseline" in smap.buffer_curves


def test_upgraded_recovery_plans_trajectories_and_tradeoffs(standard_baseline, standard_goal):
    """Verifies that all 3 plans include trajectory curves and trade-offs."""
    shocks = [
        ShockEvent(
            shock_type=ShockType.INCOME_DROP,
            start_month=2,
            duration_months=3,
            magnitude_percent=0.30
        )
    ]
    _, stressed_summary, _ = analyze_simulation_results(
        standard_baseline, standard_goal, shocks, horizon_months=36
    )
    plans = generate_recovery_plans(standard_baseline, standard_goal, shocks, stressed_summary)

    assert len(plans) == 3
    plan_ids = [p.plan_id for p in plans]
    assert plan_ids == ["aggressive", "balanced", "extended"]

    for p in plans:
        assert len(p.trajectory_curve) > 0
        assert p.buffer_preserved >= 0
        assert p.time_to_recover_months > 0
        assert len(p.pros) > 0
        assert len(p.cons) > 0
        assert len(p.trade_offs) > 10
