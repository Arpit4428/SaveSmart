"""
Unit Tests for SaveSmart Cashflow Engine
Verifies baseline formulas, free cash flow calculations, goal trajectory, and feasibility checks.
"""
from app.engine.cashflow import (
    check_baseline_feasibility,
    compute_free_cash_flow,
    compute_required_monthly_contribution,
    find_completion_month,
    project_baseline_trajectory,
)
from app.engine.models import GoalPriority, GoalSpec


def test_compute_free_cash_flow(standard_baseline):
    # Income (120,000) - Fixed (48,000) - Disc (26,000) - Debt (12,500) = 33,500
    fcf = compute_free_cash_flow(standard_baseline)
    assert fcf == 33500.0


def test_compute_required_monthly_contribution(standard_goal):
    # (500,000 - 100,000) / 20 = 20,000
    contrib = compute_required_monthly_contribution(standard_goal)
    assert contrib == 20000.0


def test_baseline_feasibility_positive_margin(standard_baseline, standard_goal):
    is_feasible, margin, msg = check_baseline_feasibility(standard_baseline, standard_goal)
    assert is_feasible is True
    assert margin == 13500.0  # 33,500 - 20,000 = 13,500
    assert "Goal is feasible" in msg


def test_baseline_feasibility_negative_margin(standard_baseline):
    # An aggressive goal requiring 50,000/mo when FCF is 33,500
    tight_goal = GoalSpec(
        goal_id="goal_tight",
        name="Ultra Rapid Goal",
        target_amount=1000000.0,
        current_balance=0.0,
        target_months=20,
        priority=GoalPriority.HIGH
    )
    is_feasible, margin, msg = check_baseline_feasibility(standard_baseline, tight_goal)
    assert is_feasible is False
    assert margin == -16500.0  # 33,500 - 50,000
    assert "Baseline Deficit Warning" in msg


def test_project_baseline_trajectory(standard_baseline, standard_goal):
    timeline = project_baseline_trajectory(standard_baseline, standard_goal, horizon_months=25)
    assert len(timeline) == 25

    # Month 1: 100,000 + 20,000 = 120,000
    assert timeline[0].month == 1
    assert timeline[0].goal_contribution == 20000.0
    assert timeline[0].goal_balance == 120000.0
    assert timeline[0].is_shock_active is False
    assert timeline[0].is_insolvent is False

    # Month 20: Reaches target of 500,000
    assert timeline[19].month == 20
    assert timeline[19].goal_balance == 500000.0

    # Month 21: Once reached, contribution ceases
    assert timeline[20].month == 21
    assert timeline[20].goal_contribution == 0.0
    assert timeline[20].goal_balance == 500000.0


def test_find_completion_month(standard_baseline, standard_goal):
    timeline = project_baseline_trajectory(standard_baseline, standard_goal, horizon_months=30)
    completion = find_completion_month(timeline, standard_goal.target_amount)
    assert completion == 20
