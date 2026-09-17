"""
SaveSmart Financial Engine — Cashflow & Baseline Trajectory
Pure deterministic mathematical functions for personal cash flow and goal progress.
All currency values in INR (₹).
"""
import math
from typing import List, Tuple, Optional
from .models import BaselineProfile, GoalSpec, MonthlySnapshot


def compute_free_cash_flow(baseline: BaselineProfile) -> float:
    """
    Computes Net Monthly Free Cash Flow:
    FCF = I_net - (E_fixed + E_discretionary + D_commitments)
    """
    return round(baseline.net_free_cash_flow, 2)


def compute_required_monthly_contribution(goal: GoalSpec) -> float:
    """
    Computes required monthly savings contribution:
    C_target = (G_target - S_0) / T_goal
    """
    return round(goal.required_monthly_contribution, 2)


def check_baseline_feasibility(baseline: BaselineProfile, goal: GoalSpec) -> Tuple[bool, float, str]:
    """
    Evaluates whether the goal is viable under baseline conditions.
    Returns: (is_feasible, margin_in_rupees, message)
    """
    fcf = compute_free_cash_flow(baseline)
    c_target = compute_required_monthly_contribution(goal)
    margin = round(fcf - c_target, 2)

    if margin >= 0:
        return (
            True,
            margin,
            f"Goal is feasible. Monthly surplus buffer is ₹{margin:,.2f} after contributing ₹{c_target:,.2f}."
        )
    else:
        return (
            False,
            margin,
            f"Baseline Deficit Warning: Goal requires ₹{c_target:,.2f}/month, but free cash flow is ₹{fcf:,.2f}/month (shortfall: ₹{abs(margin):,.2f})."
        )


def project_baseline_trajectory(
    baseline: BaselineProfile,
    goal: GoalSpec,
    horizon_months: int = 36
) -> List[MonthlySnapshot]:
    """
    Projects the month-by-month financial timeline under pre-shock baseline conditions.
    Evaluates up to horizon_months.
    """
    snapshots: List[MonthlySnapshot] = []
    current_goal_balance = float(goal.current_balance)
    current_buffer = float(baseline.emergency_fund_balance)
    c_target = compute_required_monthly_contribution(goal)
    fcf = compute_free_cash_flow(baseline)

    for month in range(1, horizon_months + 1):
        # In baseline, if goal is already reached, contribution ceases
        if current_goal_balance >= goal.target_amount:
            actual_contribution = 0.0
            surplus = fcf
        else:
            actual_contribution = min(c_target, max(0.0, goal.target_amount - current_goal_balance))
            # Allocate only up to FCF if FCF is positive
            actual_contribution = min(actual_contribution, max(0.0, fcf))
            surplus = max(0.0, fcf - actual_contribution)

        current_goal_balance = round(current_goal_balance + actual_contribution, 2)
        current_buffer = round(current_buffer + surplus, 2)

        snapshot = MonthlySnapshot(
            month=month,
            income=round(baseline.monthly_net_income, 2),
            fixed_expenses=round(baseline.fixed_expenses.total, 2),
            discretionary_expenses=round(baseline.discretionary_expenses.total, 2),
            debt_payments=round(baseline.total_debt_payment, 2),
            extra_expenses=0.0,
            free_cash_flow=round(fcf, 2),
            goal_contribution=round(actual_contribution, 2),
            goal_balance=round(current_goal_balance, 2),
            emergency_buffer_balance=round(current_buffer, 2),
            is_shock_active=False,
            is_insolvent=False,
            deficit_amount=0.0
        )
        snapshots.append(snapshot)

    return snapshots


def find_completion_month(snapshots: List[MonthlySnapshot], target_amount: float) -> Optional[int]:
    """
    Identifies the earliest month index where goal balance meets or exceeds target amount.
    """
    for snap in snapshots:
        if snap.goal_balance >= target_amount:
            return snap.month
    return None
