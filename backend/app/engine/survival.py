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

    buffer_curves = {
        "baseline": [baseline.emergency_fund_balance] + [s.emergency_buffer_balance for s in baseline_snaps],
        "stressed": [baseline.emergency_fund_balance] + [s.emergency_buffer_balance for s in stressed_snaps],
        "recovered_balanced": [baseline.emergency_fund_balance] + [s.emergency_buffer_balance for s in recovered_snaps]
    }

    # Identify Completion Months
    base_comp = None
    for idx, val in enumerate(baseline_curve):
        if val >= goal.target_amount:
            base_comp = idx
            break
    if base_comp is None:
        base_comp = goal.target_months

    stressed_comp = None
    for idx, val in enumerate(stressed_curve):
        if val >= goal.target_amount:
            stressed_comp = idx
            break

    recovered_comp = None
    for idx, val in enumerate(recovered_curve):
        if val >= goal.target_amount:
            recovered_comp = idx
            break

    # Slippage
    if stressed_comp is not None:
        deadline_slippage = max(0, stressed_comp - base_comp)
    else:
        deadline_slippage = horizon_months - base_comp

    # Capital Shortfall at Original Deadline
    deadline_idx = min(goal.target_months, len(stressed_curve) - 1)
    stressed_bal_at_deadline = stressed_curve[deadline_idx]
    capital_shortfall = max(0.0, round(goal.target_amount - stressed_bal_at_deadline, 2))

    # First Unsafe Month
    first_unsafe_month = None
    peak_deficit = 0.0
    min_buffer = float(baseline.emergency_fund_balance)
    insolvent_seen = False

    for s in stressed_snaps:
        if s.emergency_buffer_balance < min_buffer:
            min_buffer = s.emergency_buffer_balance
        if s.is_insolvent:
            insolvent_seen = True
            if s.deficit_amount > peak_deficit:
                peak_deficit = s.deficit_amount

        if first_unsafe_month is None:
            if s.is_insolvent or s.emergency_buffer_balance <= 0.0 or s.free_cash_flow < 0:
                first_unsafe_month = s.month
            elif s.is_shock_active and s.goal_contribution < base_contrib:
                first_unsafe_month = s.month

    b0 = baseline.emergency_fund_balance
    buffer_loss = max(0.0, b0 - min_buffer)
    max_drawdown = round(buffer_loss + peak_deficit, 2)

    # Final Status & Deterministic Verdict
    if insolvent_seen or min_buffer <= 0.0:
        final_status = "CRITICAL"
        survival_verdict = (
            f"Goal becomes critically compromised in Month {first_unsafe_month or 1}! "
            f"Emergency buffers are exhausted (drawdown: ₹{max_drawdown:,.2f}). "
            f"Balanced recovery path restores solvency by Month {recovered_comp or horizon_months}."
        )
    elif deadline_slippage > 0 or capital_shortfall > 0:
        final_status = "DELAYED"
        recovery_txt = f" Balanced recovery accelerates completion to Month {recovered_comp}." if recovered_comp else ""
        survival_verdict = (
            f"Goal survives disruption with a {deadline_slippage}-month delay and ₹{capital_shortfall:,.2f} shortfall at original deadline.{recovery_txt}"
        )
    else:
        final_status = "SURVIVED"
        survival_verdict = (
            f"Goal survives the disruption cleanly! Contributions absorb shock impact, "
            f"reaching ₹{goal.target_amount:,.2f} on schedule by Month {base_comp}."
        )

    # Safe buffer threshold: 3 months of fixed expenses or baseline emergency fund
    safe_buffer_threshold = round(max(baseline.fixed_expenses.total * 3.0, baseline.emergency_fund_balance), 2)

    return SurvivalMapData(
        goal_id=goal.goal_id,
        currency="INR",
        total_months=horizon_months,
        insolvency_threshold=0.00,
        safe_buffer_threshold=safe_buffer_threshold,
        curves=curves,
        target_amount=round(goal.target_amount, 2),
        target_deadline_months=goal.target_months,
        first_unsafe_month=first_unsafe_month,
        max_drawdown=max_drawdown,
        deadline_slippage=deadline_slippage,
        capital_shortfall=capital_shortfall,
        recovery_point_month=recovered_comp,
        final_status=final_status,
        survival_verdict=survival_verdict,
        buffer_curves=buffer_curves
    )

