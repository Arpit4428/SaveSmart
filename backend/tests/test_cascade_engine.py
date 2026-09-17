"""
Unit Tests for SaveSmart Cascade Engine
Verifies compound multi-shock sequences, liquidity buffer drawdown, insolvency triggers,
and timeline slippage.
"""
from app.engine.cascade import analyze_simulation_results, simulate_cascade_progression
from app.engine.models import ShockEvent, ShockType


def test_zero_shocks_cascade_matches_baseline(standard_baseline, standard_goal):
    """Running cascade with zero shocks should cleanly produce baseline completion."""
    baseline_summary, stressed_summary, timeline = analyze_simulation_results(
        standard_baseline,
        standard_goal,
        shocks=[],
        horizon_months=30
    )
    assert baseline_summary.completion_month == 20
    assert stressed_summary.completion_month == 20
    assert stressed_summary.slippage_months == 0
    assert stressed_summary.capital_deficit == 0.0
    assert stressed_summary.insolvency_triggered is False
    assert stressed_summary.buffer_exhausted is False


def test_mild_shock_causes_slippage_without_insolvency(standard_baseline, standard_goal):
    """
    35% income drop for 4 months (Months 3 to 6).
    Income drops from 120,000 to 78,000.
    Expenses = 86,500 -> Deficit of -8,500/month for 4 months.
    Buffer of 150,000 absorbs 4 * 8,500 = 34,000 easily (buffer drops to ~116,000).
    Goal contributions pause for 4 months -> Slippage occurs (~4 months delay).
    """
    shocks = [
        ShockEvent(
            shock_type=ShockType.INCOME_DROP,
            start_month=3,
            duration_months=4,
            magnitude_percent=0.35
        )
    ]
    baseline_summary, stressed_summary, timeline = analyze_simulation_results(
        standard_baseline,
        standard_goal,
        shocks=shocks,
        horizon_months=36
    )

    assert baseline_summary.completion_month == 20
    assert stressed_summary.completion_month > 20
    assert stressed_summary.slippage_months >= 3
    assert stressed_summary.insolvency_triggered is False
    assert stressed_summary.buffer_exhausted is False
    assert stressed_summary.minimum_cash_buffer > 0.0


def test_compound_cascade_triggers_insolvency(standard_baseline, standard_goal):
    """
    Compound Cascade:
    1. 50% income drop for 4 months starting month 2
    2. Huge ₹2,00,000 medical emergency at month 3
    Total shock exceeds the ₹1,50,000 emergency buffer, triggering an insolvency event.
    """
    shocks = [
        ShockEvent(
            shock_type=ShockType.INCOME_DROP,
            start_month=2,
            duration_months=4,
            magnitude_percent=0.50,
            description="50% Pay Cut"
        ),
        ShockEvent(
            shock_type=ShockType.LUMP_SUM_EXPENSE,
            start_month=3,
            amount=200000.0,
            description="Emergency Surgery Co-Pay"
        )
    ]
    baseline_summary, stressed_summary, timeline = analyze_simulation_results(
        standard_baseline,
        standard_goal,
        shocks=shocks,
        horizon_months=40
    )

    assert stressed_summary.insolvency_triggered is True
    assert stressed_summary.buffer_exhausted is True
    assert stressed_summary.insolvency_first_month is not None
    assert stressed_summary.peak_deficit > 0.0
    assert stressed_summary.slippage_months >= 4
    assert stressed_summary.capital_deficit > 0.0
