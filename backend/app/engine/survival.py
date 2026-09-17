"""
SaveSmart Financial Engine — Goal Survival Map Generator
Generates time-series trajectory curves comparing:
- Baseline progression
- Stressed progression under shocks
- Recovered progression (Balanced recovery strategy)
Includes insolvency danger thresholds and emergency cushion safety levels.
All values denominated in Indian Rupees (INR / ₹).
"""
from typing import Dict, List
from .models import (
    BaselineProfile,
    DiscretionaryExpenses,
    GoalSpec,
    ShockEvent,
    SurvivalMapData,
)
from .cashflow import compute_required_monthly_contribution, project_baseline_trajectory
from .cascade import simulate_cascade_progression


def generate_survival_map(
    baseline: BaselineProfile,
    goal: GoalSpec,
    shocks: List[ShockEvent],
    horizon_months: int = 36
) -> SurvivalMapData:
    """
    Constructs multi-scenario comparative curves for the Goal Survival Map visualization.
    """
    # 1. Baseline curve
    baseline_snaps = project_baseline_trajectory(baseline, goal, horizon_months=horizon_months)
    baseline_curve = [goal.current_balance] + [s.goal_balance for s in baseline_snaps]

    # 2. Stressed curve
    stressed_snaps = simulate_cascade_progression(baseline, goal, shocks, horizon_months=horizon_months)
    stressed_curve = [goal.current_balance] + [s.goal_balance for s in stressed_snaps]

    # 3. Recovered (Balanced) curve:
    # Model 25% discretionary spending trim applied from month 1
    # Reallocate 70% of freed cash to increase monthly goal contributions
    base_contrib = compute_required_monthly_contribution(goal)
    balanced_cut_ratio = 0.25
    monthly_disc_savings = round(baseline.discretionary_expenses.total * balanced_cut_ratio, 2)
    adjusted_monthly_contrib = round(base_contrib + (monthly_disc_savings * 0.70), 2)

    recovered_discretionary = DiscretionaryExpenses(
        dining_out=round(baseline.discretionary_expenses.dining_out * (1.0 - balanced_cut_ratio), 2),
        entertainment=round(baseline.discretionary_expenses.entertainment * (1.0 - balanced_cut_ratio), 2),
        shopping=round(baseline.discretionary_expenses.shopping * (1.0 - balanced_cut_ratio), 2),
        other=round(baseline.discretionary_expenses.other * (1.0 - balanced_cut_ratio), 2),
        custom_discretionary={
            k: round(v * (1.0 - balanced_cut_ratio), 2)
            for k, v in baseline.discretionary_expenses.custom_discretionary.items()
        }
    )

    recovered_baseline = BaselineProfile(
        user_id=baseline.user_id,
        monthly_net_income=baseline.monthly_net_income,
        fixed_expenses=baseline.fixed_expenses,
        discretionary_expenses=recovered_discretionary,
        debt_commitments=baseline.debt_commitments,
        emergency_fund_balance=baseline.emergency_fund_balance
    )

    recovered_snaps = simulate_cascade_progression(
        recovered_baseline,
        goal,
        shocks,
        horizon_months=horizon_months,
        monthly_contribution_override=adjusted_monthly_contrib
    )
    recovered_curve = [goal.current_balance] + [s.goal_balance for s in recovered_snaps]

    curves = {
        "baseline": baseline_curve,
        "stressed": stressed_curve,
        "recovered_balanced": recovered_curve
    }

    return SurvivalMapData(
        goal_id=goal.goal_id,
        currency="INR",
        total_months=horizon_months,
        insolvency_threshold=0.00,
        safe_buffer_threshold=round(baseline.emergency_fund_balance, 2),
        curves=curves
    )
