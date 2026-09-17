"""
Unit Tests for SaveSmart Health Scoring & Resilience Evaluation
Verifies mathematical weighting, Phi components, grade thresholds, and baseline health checks.
"""
from app.engine.health import (
    calculate_phi_buffer,
    calculate_phi_dti,
    calculate_phi_flex,
    calculate_phi_slip,
    compute_resilience_score,
    evaluate_baseline_goal_health,
    get_resilience_grade,
)
from app.engine.models import (
    BaselineProfile,
    FixedExpenses,
    DiscretionaryExpenses,
    GoalPriority,
    GoalSpec,
    ResilienceGrade,
    StressedSimulationSummary,
)


def test_phi_buffer_calculation():
    # 3.0+ months coverage -> 1.0
    assert calculate_phi_buffer(150000.0, 48000.0, False) == 1.0
    # 1.5 months coverage -> 0.5
    assert calculate_phi_buffer(72000.0, 48000.0, False) == 0.5
    # Insolvency triggered -> 0.0
    assert calculate_phi_buffer(0.0, 48000.0, True) == 0.0


def test_phi_flex_calculation():
    # 26,000 / (48,000 + 26,000) = 0.351 -> > 0.30 -> capped at 1.0
    assert calculate_phi_flex(48000.0, 26000.0) == 1.0
    # 5,000 / 55,000 = 0.0909 -> 0.0909 / 0.30 = ~0.303
    flex = calculate_phi_flex(50000.0, 5000.0)
    assert 0.29 < flex < 0.32


def test_phi_slip_calculation():
    # 0 slippage out of 20 months -> 1.0
    assert calculate_phi_slip(0, 20) == 1.0
    # 5 months slippage out of 20 -> 1 - 5/20 = 0.75
    assert calculate_phi_slip(5, 20) == 0.75
    # 25 months slippage out of 20 -> capped at 0.0
    assert calculate_phi_slip(25, 20) == 0.0


def test_phi_dti_calculation():
    # DTI <= 15% -> 1.0
    assert calculate_phi_dti(12000.0, 100000.0) == 1.0
    # DTI >= 50% -> 0.0
    assert calculate_phi_dti(60000.0, 100000.0) == 0.0
    # DTI = 32.5% (midway between 15% and 50%) -> 0.5
    dti_phi = calculate_phi_dti(32500.0, 100000.0)
    assert abs(dti_phi - 0.5) < 0.01


def test_resilience_grade_tiers():
    assert get_resilience_grade(85.0) == ResilienceGrade.ROBUST
    assert get_resilience_grade(68.0) == ResilienceGrade.MODERATE
    assert get_resilience_grade(45.0) == ResilienceGrade.VULNERABLE
    assert get_resilience_grade(28.0) == ResilienceGrade.CRITICAL


def test_evaluate_baseline_goal_health_healthy(standard_baseline, standard_goal):
    report = evaluate_baseline_goal_health(standard_baseline, standard_goal)
    assert report.currency == "INR"
    assert report.health_status == "HEALTHY"
    assert report.baseline_resilience_score >= 80.0
    assert report.free_cash_flow_margin > 0


def test_evaluate_baseline_goal_health_fragile():
    fragile_baseline = BaselineProfile(
        user_id="user_fragile",
        monthly_net_income=50000.0,
        fixed_expenses=FixedExpenses(rent_or_mortgage=35000.0, utilities=5000.0),
        discretionary_expenses=DiscretionaryExpenses(dining_out=2000.0),
        emergency_fund_balance=10000.0  # only 0.25 months coverage!
    )
    goal = GoalSpec(
        goal_id="goal_fragile",
        name="Emergency Stash",
        target_amount=100000.0,
        current_balance=0.0,
        target_months=10  # requires 10,000/mo, but FCF is only 8,000!
    )
    report = evaluate_baseline_goal_health(fragile_baseline, goal)
    assert report.health_status == "AT_RISK"
    assert report.free_cash_flow_margin < 0  # deficit
    assert any(rf.factor == "cashflow_deficit" for rf in report.risk_factors)
    assert any(rf.factor == "emergency_buffer" for rf in report.risk_factors)


def test_compute_resilience_score_stressed(standard_baseline, standard_goal):
    # Create a stressed summary with 5 months slippage and 0 buffer (insolvency)
    stressed_summary = StressedSimulationSummary(
        completion_month=25,
        slippage_months=5,
        final_balance_at_original_deadline=400000.0,
        capital_deficit=100000.0,
        minimum_cash_buffer=0.0,
        buffer_exhausted=True,
        insolvency_triggered=True,
        insolvency_first_month=3,
        peak_deficit=25000.0
    )
    score, grade, components = compute_resilience_score(standard_baseline, standard_goal, stressed_summary)
    assert 0.0 <= score <= 100.0
    assert grade in [ResilienceGrade.ROBUST, ResilienceGrade.MODERATE, ResilienceGrade.VULNERABLE, ResilienceGrade.CRITICAL]
    assert components["phi_buffer"] == 0.0  # Because insolvency triggered
    assert components["phi_slip"] == 0.75   # 1.0 - 5/20 = 0.75
