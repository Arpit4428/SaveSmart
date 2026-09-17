"""
SaveSmart Financial Engine — Cascade Simulation & Liquidity Propagation
Pure deterministic multi-shock simulator modeling compound sequence effects on cashflow,
emergency fund depletion, insolvency events, and goal savings slippage.
All values denominated in Indian Rupees (INR / ₹).
"""
import math
from typing import List, Optional, Tuple
from .models import (
    BaselineProfile,
    GoalSpec,
    MonthlySnapshot,
    ShockEvent,
    SimulationTimelineSummary,
    StressedSimulationSummary,
)
from .cashflow import compute_required_monthly_contribution, project_baseline_trajectory
from .shocks import (
    compute_monthly_income_under_shocks,
    compute_monthly_expenses_under_shocks,
    compute_monthly_debt_payments_under_shocks,
)


def simulate_cascade_progression(
    baseline: BaselineProfile,
    goal: GoalSpec,
    shocks: List[ShockEvent],
    horizon_months: int = 48,
    monthly_contribution_override: Optional[float] = None
) -> List[MonthlySnapshot]:
    """
    Executes a discrete month-by-month financial simulation incorporating all active shocks.
    Simulates:
    1. Stressed cash flow calculation
    2. Emergency buffer drawdown & replenishment
    3. Insolvency trigger if buffer drops below zero
    4. Goal savings accumulation
    """
    snapshots: List[MonthlySnapshot] = []
    current_goal_balance = float(goal.current_balance)
    current_buffer = float(baseline.emergency_fund_balance)
    
    if monthly_contribution_override is not None:
        c_target = float(monthly_contribution_override)
    else:
        c_target = compute_required_monthly_contribution(goal)

    for month in range(1, horizon_months + 1):
        # 1. Income under shocks
        income, income_shock_active = compute_monthly_income_under_shocks(
            baseline.monthly_net_income, month, shocks
        )

        # 2. Expenses under shocks
        fixed_exp, disc_exp, extra_lump, expense_shock_active = compute_monthly_expenses_under_shocks(
            baseline.fixed_expenses.total,
            baseline.discretionary_expenses.total,
            month,
            shocks
        )

        # 3. Debt payments under shocks
        debt_payment, debt_shock_active = compute_monthly_debt_payments_under_shocks(
            baseline.debt_commitments, month, shocks
        )

        # Any shock active this month?
        is_shock_active = (income_shock_active or expense_shock_active or debt_shock_active)

        # Stressed net cash flow before goal contribution
        fcf_stressed = round(income - (fixed_exp + disc_exp + debt_payment + extra_lump), 2)

        is_insolvent = False
        deficit_amount = 0.0
        actual_contribution = 0.0

        # Has the goal already reached the target?
        goal_already_achieved = current_goal_balance >= goal.target_amount

        # Case A: Positive Cash Flow
        if fcf_stressed >= 0:
            if not goal_already_achieved:
                # Goal contribution takes precedence up to c_target and remaining target gap
                desired_contrib = min(c_target, max(0.0, goal.target_amount - current_goal_balance))
                actual_contribution = min(desired_contrib, fcf_stressed)
                surplus = fcf_stressed - actual_contribution
            else:
                actual_contribution = 0.0
                surplus = fcf_stressed

            # Surplus cash replenishes buffer
            current_buffer = round(current_buffer + surplus, 2)

        # Case B: Negative Cash Flow (Deficit Month)
        else:
            # Goal contributions are immediately halted during a deficit month
            actual_contribution = 0.0
            deficit = abs(fcf_stressed)

            if current_buffer >= deficit:
                # Emergency buffer absorbs the deficit completely
                current_buffer = round(current_buffer - deficit, 2)
            else:
                # Emergency buffer is exhausted; remaining deficit is unabsorbed (Insolvency)
                unabsorbed_deficit = round(deficit - current_buffer, 2)
                current_buffer = 0.0
                is_insolvent = True
                deficit_amount = unabsorbed_deficit

        current_goal_balance = round(current_goal_balance + actual_contribution, 2)

        snapshot = MonthlySnapshot(
            month=month,
            income=income,
            fixed_expenses=fixed_exp,
            discretionary_expenses=disc_exp,
            debt_payments=debt_payment,
            extra_expenses=extra_lump,
            free_cash_flow=fcf_stressed,
            goal_contribution=round(actual_contribution, 2),
            goal_balance=current_goal_balance,
            emergency_buffer_balance=current_buffer,
            is_shock_active=is_shock_active,
            is_insolvent=is_insolvent,
            deficit_amount=deficit_amount
        )
        snapshots.append(snapshot)

    return snapshots


def analyze_simulation_results(
    baseline: BaselineProfile,
    goal: GoalSpec,
    shocks: List[ShockEvent],
    horizon_months: int = 48
) -> Tuple[SimulationTimelineSummary, StressedSimulationSummary, List[MonthlySnapshot]]:
    """
    Simulates baseline and stressed timelines and produces deterministic comparison metrics.
    """
    # 1. Baseline projection
    baseline_snaps = project_baseline_trajectory(baseline, goal, horizon_months=horizon_months)
    baseline_completion_month: Optional[int] = None
    for s in baseline_snaps:
        if s.goal_balance >= goal.target_amount:
            baseline_completion_month = s.month
            break

    baseline_summary = SimulationTimelineSummary(
        completion_month=baseline_completion_month,
        final_balance=baseline_snaps[-1].goal_balance if baseline_snaps else goal.current_balance
    )

    # 2. Stressed progression under shocks
    stressed_snaps = simulate_cascade_progression(baseline, goal, shocks, horizon_months=horizon_months)

    stressed_completion_month: Optional[int] = None
    min_cash_buffer = float(baseline.emergency_fund_balance)
    buffer_exhausted = False
    insolvency_triggered = False
    insolvency_first_month: Optional[int] = None
    peak_deficit = 0.0

    for s in stressed_snaps:
        if s.goal_balance >= goal.target_amount and stressed_completion_month is None:
            stressed_completion_month = s.month

        if s.emergency_buffer_balance < min_cash_buffer:
            min_cash_buffer = s.emergency_buffer_balance

        if s.emergency_buffer_balance <= 0.0:
            buffer_exhausted = True

        if s.is_insolvent:
            insolvency_triggered = True
            if insolvency_first_month is None:
                insolvency_first_month = s.month
            if s.deficit_amount > peak_deficit:
                peak_deficit = s.deficit_amount

    # Balance at original target deadline
    deadline_month = goal.target_months
    balance_at_deadline = goal.current_balance
    if deadline_month <= len(stressed_snaps) and deadline_month > 0:
        balance_at_deadline = stressed_snaps[deadline_month - 1].goal_balance
    elif stressed_snaps:
        balance_at_deadline = stressed_snaps[-1].goal_balance

    capital_deficit = max(0.0, round(goal.target_amount - balance_at_deadline, 2))

    # Slippage calculation
    if baseline_completion_month is not None:
        if stressed_completion_month is not None:
            slippage = max(0, stressed_completion_month - baseline_completion_month)
        else:
            # If not completed within horizon, assign horizon - baseline completion
            slippage = horizon_months - baseline_completion_month
    else:
        slippage = 0

    stressed_summary = StressedSimulationSummary(
        completion_month=stressed_completion_month,
        slippage_months=slippage,
        final_balance_at_original_deadline=round(balance_at_deadline, 2),
        capital_deficit=round(capital_deficit, 2),
        minimum_cash_buffer=round(min_cash_buffer, 2),
        buffer_exhausted=buffer_exhausted,
        insolvency_triggered=insolvency_triggered,
        insolvency_first_month=insolvency_first_month,
        peak_deficit=round(peak_deficit, 2)
    )

    return (baseline_summary, stressed_summary, stressed_snaps)
