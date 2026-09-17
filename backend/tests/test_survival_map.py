"""
Unit Tests for SaveSmart Goal Survival Map Generator
Verifies multi-scenario time-series curve generation, thresholds, and data points.
"""
from app.engine.models import ShockEvent, ShockType
from app.engine.survival import generate_survival_map


def test_generate_survival_map_curves(standard_baseline, standard_goal):
    shocks = [
        ShockEvent(
            shock_type=ShockType.INCOME_DROP,
            start_month=2,
            duration_months=3,
            magnitude_percent=0.40
        )
    ]

    survival_data = generate_survival_map(
        standard_baseline,
        standard_goal,
        shocks=shocks,
        horizon_months=24
    )

    assert survival_data.goal_id == standard_goal.goal_id
    assert survival_data.currency == "INR"
    assert survival_data.total_months == 24
    assert survival_data.insolvency_threshold == 0.0
    assert survival_data.safe_buffer_threshold == 150000.0

    curves = survival_data.curves
    assert "baseline" in curves
    assert "stressed" in curves
    assert "recovered_balanced" in curves

    # All curves start at current balance (100,000)
    assert curves["baseline"][0] == 100000.0
    assert curves["stressed"][0] == 100000.0
    assert curves["recovered_balanced"][0] == 100000.0

    # Curve lengths should be horizon + 1 (month 0 to month 24)
    assert len(curves["baseline"]) == 25
    assert len(curves["stressed"]) == 25
    assert len(curves["recovered_balanced"]) == 25

    # By month 20 (original target date):
    # Baseline reaches goal (500,000)
    assert curves["baseline"][20] == 500000.0
    # Stressed curve is lower than baseline due to shock
    assert curves["stressed"][20] < curves["baseline"][20]
    # Recovered curve outperforms stressed curve
    assert curves["recovered_balanced"][20] > curves["stressed"][20]
