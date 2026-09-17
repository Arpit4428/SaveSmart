"""
SaveSmart Financial Engine — Adaptive Recovery Optimization Solver
Pure deterministic optimization generating 3 actionable recovery paths:
- Plan 1: Aggressive Action (Minimize slippage by cutting discretionary spend)
- Plan 2: Balanced Compromise (Moderate budget cut + modest timeline extension)
- Plan 3: Extended Timeline (Zero spending cuts, absorb full natural delay)
All values denominated in Indian Rupees (INR / ₹).
"""
import math
from typing import List
from .models import (
    BaselineProfile,
    GoalSpec,
    RecoveryPlan,
    ShockEvent,
    StressedSimulationSummary,
)
from .cashflow import compute_required_monthly_contribution
from .cascade import simulate_cascade_progression


def _find_buffer_replenished_month(
    snapshots,
    target_buffer: float,
    start_search_month: int = 1
) -> int:
    """Finds the month where emergency buffer balance returns to or exceeds target_buffer."""
    for s in snapshots:
        if s.month >= start_search_month and s.emergency_buffer_balance >= target_buffer:
            return s.month
    return snapshots[-1].month if snapshots else start_search_month


def generate_recovery_plans(
    baseline: BaselineProfile,
    goal: GoalSpec,
    shocks: List[ShockEvent],
    stressed_summary: StressedSimulationSummary
) -> List[RecoveryPlan]:
    """
    Computes 3 deterministic recovery paths for the user to recover from applied shocks.
    """
    disc_exp = baseline.discretionary_expenses.total
    base_contrib = compute_required_monthly_contribution(goal)
    target_months = goal.target_months
    shortfall = stressed_summary.capital_deficit
    target_buffer = baseline.emergency_fund_balance

    # -------------------------------------------------------------
    # Plan 1: Aggressive Action (Prioritize Original Deadline)
    # -------------------------------------------------------------
    # Solve for required cut to close capital deficit by deadline
    remaining_months_to_deadline = max(1, target_months)
    monthly_extra_needed = shortfall / remaining_months_to_deadline if remaining_months_to_deadline > 0 else shortfall

    if disc_exp > 0:
        raw_cut_ratio = monthly_extra_needed / disc_exp
        aggressive_cut_ratio = max(0.40, min(0.75, raw_cut_ratio))
    else:
        aggressive_cut_ratio = 0.50

    aggressive_savings = round(disc_exp * aggressive_cut_ratio, 2)
    aggressive_contrib = round(base_contrib + aggressive_savings, 2)

    # Estimate aggressive slippage: significantly reduced slippage
    aggressive_slippage = max(1, int(math.ceil(stressed_summary.slippage_months * 0.20))) if stressed_summary.slippage_months > 0 else 0
    aggressive_completion_month = target_months + aggressive_slippage

    # Feasibility penalty: larger cuts reduce feasibility
    aggressive_feasibility = round(max(40.0, min(80.0, 100.0 - (aggressive_cut_ratio * 55.0))), 1)
    aggressive_buffer_replenished = max(1, min(target_months, 8 + aggressive_slippage))

    plan_aggressive = RecoveryPlan(
        plan_id="aggressive",
        name="Aggressive Expense Cut",
        target_completion_month=aggressive_completion_month,
        slippage_months=aggressive_slippage,
        discretionary_cut_percent=round(aggressive_cut_ratio, 2),
        discretionary_savings_monthly=aggressive_savings,
        monthly_contribution_adjusted=aggressive_contrib,
        emergency_buffer_replenished_month=aggressive_buffer_replenished,
        feasibility_score=aggressive_feasibility,
        description=(
            f"Cuts flexible spending by {int(aggressive_cut_ratio * 100)}% "
            f"(saving ₹{aggressive_savings:,.2f}/month) immediately to preserve target date with minimal slippage."
        )
    )

    # -------------------------------------------------------------
    # Plan 2: Balanced Compromise (Recommended)
    # -------------------------------------------------------------
    balanced_cut_ratio = 0.25
    balanced_savings = round(disc_exp * balanced_cut_ratio, 2)
    balanced_contrib = round(base_contrib + (balanced_savings * 0.70), 2)

    # Slippage is reduced by ~60% compared to organic slippage
    if stressed_summary.slippage_months > 0:
        balanced_slippage = max(2, int(math.ceil(stressed_summary.slippage_months * 0.40)))
    else:
        balanced_slippage = 0
    balanced_completion_month = target_months + balanced_slippage

    balanced_feasibility = 92.0
    balanced_buffer_replenished = max(1, min(target_months + balanced_slippage, 12))

    plan_balanced = RecoveryPlan(
        plan_id="balanced",
        name="Balanced Compromise",
        target_completion_month=balanced_completion_month,
        slippage_months=balanced_slippage,
        discretionary_cut_percent=balanced_cut_ratio,
        discretionary_savings_monthly=balanced_savings,
        monthly_contribution_adjusted=balanced_contrib,
        emergency_buffer_replenished_month=balanced_buffer_replenished,
        feasibility_score=balanced_feasibility,
        description=(
            f"Moderate 25% budget trim (saving ₹{balanced_savings:,.2f}/month) "
            f"paired with a modest {balanced_slippage}-month timeline extension."
        )
    )

    # -------------------------------------------------------------
    # Plan 3: Extended Timeline (Zero Lifestyle Disruption)
    # -------------------------------------------------------------
    extended_cut_ratio = 0.0
    extended_savings = 0.0
    extended_contrib = base_contrib
    extended_slippage = stressed_summary.slippage_months
    extended_completion_month = target_months + extended_slippage
    extended_feasibility = 98.0
    extended_buffer_replenished = max(1, target_months + extended_slippage - 4)

    plan_extended = RecoveryPlan(
        plan_id="extended",
        name="Extended Timeline (Zero Lifestyle Change)",
        target_completion_month=extended_completion_month,
        slippage_months=extended_slippage,
        discretionary_cut_percent=extended_cut_ratio,
        discretionary_savings_monthly=extended_savings,
        monthly_contribution_adjusted=extended_contrib,
        emergency_buffer_replenished_month=extended_buffer_replenished,
        feasibility_score=extended_feasibility,
        description=(
            f"Preserves all existing lifestyle habits with 0% budget cuts, "
            f"accepting an organic {extended_slippage}-month delay to reach the ₹{goal.target_amount:,.2f} goal."
        )
    )

    return [plan_aggressive, plan_balanced, plan_extended]
