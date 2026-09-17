"""
SaveSmart Financial Engine — Shock Calculators
Pure deterministic implementations of personal financial shocks:
- Income drops (layoff, pay cut, furlough)
- Lump sum expense shocks (medical emergency, car repair)
- Inflation spikes (escalating living costs)
- Interest rate hikes (loan repayment escalation)
All calculations denominated in INR (₹).
"""
from typing import List, Tuple
from .models import DebtCommitment, ShockEvent, ShockType


def compute_monthly_income_under_shocks(
    base_income: float,
    month: int,
    shocks: List[ShockEvent]
) -> Tuple[float, bool]:
    """
    Computes effective net income at month t after applying active income shocks.
    Returns: (effective_income, is_shock_active)
    """
    effective_income = float(base_income)
    is_active = False

    for shock in shocks:
        if shock.shock_type == ShockType.INCOME_DROP:
            end_month = shock.start_month + max(1, shock.duration_months) - 1
            if shock.start_month <= month <= end_month:
                is_active = True
                reduction_fraction = min(1.0, max(0.0, shock.magnitude_percent))
                effective_income *= (1.0 - reduction_fraction)

    return (round(max(0.0, effective_income), 2), is_active)


def compute_monthly_expenses_under_shocks(
    base_fixed: float,
    base_discretionary: float,
    month: int,
    shocks: List[ShockEvent]
) -> Tuple[float, float, float, bool]:
    """
    Computes fixed, discretionary, and extra lump-sum expenses for month t.
    Returns: (fixed_expenses, discretionary_expenses, lump_sum_expenses, is_shock_active)
    """
    fixed = float(base_fixed)
    discretionary = float(base_discretionary)
    extra_lump_sum = 0.0
    is_active = False

    for shock in shocks:
        if shock.shock_type == ShockType.LUMP_SUM_EXPENSE:
            if shock.start_month == month:
                extra_lump_sum += max(0.0, shock.amount)
                is_active = True

        elif shock.shock_type == ShockType.INFLATION_SPIKE:
            end_month = shock.start_month + max(1, shock.duration_months) - 1
            if shock.start_month <= month <= end_month:
                is_active = True
                # Annualized inflation bump i, monthly compound factor:
                months_elapsed = month - shock.start_month + 1
                annual_rate = max(0.0, shock.magnitude_percent)
                compound_factor = (1.0 + (annual_rate / 12.0)) ** months_elapsed
                fixed *= compound_factor
                discretionary *= compound_factor

    return (
        round(fixed, 2),
        round(discretionary, 2),
        round(extra_lump_sum, 2),
        is_active
    )


def compute_monthly_debt_payments_under_shocks(
    debt_commitments: List[DebtCommitment],
    month: int,
    shocks: List[ShockEvent]
) -> Tuple[float, bool]:
    """
    Computes debt payments for month t, applying interest rate hikes to variable debt.
    Returns: (total_debt_payment, is_shock_active)
    """
    total_payment = sum(d.monthly_payment for d in debt_commitments)
    is_active = False

    for shock in shocks:
        if shock.shock_type == ShockType.INTEREST_RATE_HIKE:
            end_month = shock.start_month + max(1, shock.duration_months) - 1
            if shock.start_month <= month <= end_month:
                is_active = True
                delta_rate = max(0.0, shock.magnitude_percent)
                
                # Check if specific debts are marked variable; if none, apply to all debts
                has_variable = any(d.is_variable_rate for d in debt_commitments)
                for debt in debt_commitments:
                    if (not has_variable) or debt.is_variable_rate:
                        additional_monthly_interest = debt.remaining_balance * (delta_rate / 12.0)
                        total_payment += additional_monthly_interest

    return (round(total_payment, 2), is_active)
