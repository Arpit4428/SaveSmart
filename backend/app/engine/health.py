"""
SaveSmart Financial Engine — Health Scoring & Resilience Evaluation
Pure deterministic mathematical scoring producing the SaveSmart Resilience Score (0–100),
risk factors, and resilience grade classification.
All calculations denominated in Indian Rupees (INR / ₹).
"""
from typing import Dict, List, Tuple
from .models import (
    BaselineProfile,
    GoalHealthReport,
    GoalSpec,
    HealthRiskFactor,
    ResilienceGrade,
    StressedSimulationSummary,
)
from .cashflow import compute_free_cash_flow, compute_required_monthly_contribution

# Formula weights as specified in FINANCIAL_RULES.md
W_BUFFER = 0.35  # Emergency Buffer Protection
W_FLEX = 0.25    # Discretionary Elasticity
W_SLIP = 0.25    # Timeline Slippage Penalty
W_DTI = 0.15     # Debt-to-Income Health


def get_resilience_grade(score: float) -> ResilienceGrade:
    """Classifies 0-100 score into standard resilience tiers."""
    if score >= 80.0:
        return ResilienceGrade.ROBUST
    elif score >= 60.0:
        return ResilienceGrade.MODERATE
    elif score >= 40.0:
        return ResilienceGrade.VULNERABLE
    else:
        return ResilienceGrade.CRITICAL


def calculate_phi_buffer(
    min_buffer_balance: float,
    fixed_expenses_monthly: float,
    insolvency_triggered: bool
) -> float:
    """
    Phi_buffer component: Emergency buffer months coverage.
    Coverage = min(B_t) / E_fixed.
    If insolvency occurred, Phi_buffer = 0.0.
    If Coverage >= 3.0, Phi_buffer = 1.0.
    Else Coverage / 3.0.
    """
    if insolvency_triggered or min_buffer_balance < 0.0 or fixed_expenses_monthly <= 0:
        return 0.0

    coverage_months = min_buffer_balance / fixed_expenses_monthly
    if coverage_months >= 3.0:
        return 1.0
    return max(0.0, min(1.0, coverage_months / 3.0))


def calculate_phi_flex(fixed_expenses: float, discretionary_expenses: float) -> float:
    """
    Phi_flex component: Discretionary spending elasticity.
    FlexRatio = E_discretionary / (E_fixed + E_discretionary)
    Phi_flex = min(1.0, FlexRatio / 0.30)
    """
    total_spending = fixed_expenses + discretionary_expenses
    if total_spending <= 0:
        return 1.0
    flex_ratio = discretionary_expenses / total_spending
    return max(0.0, min(1.0, flex_ratio / 0.30))


def calculate_phi_slip(slippage_months: int, target_months: int) -> float:
    """
    Phi_slip component: Timeline delay penalty.
    Phi_slip = max(0.0, 1.0 - (slippage / target_months))
    """
    if target_months <= 0:
        return 0.0 if slippage_months > 0 else 1.0
    penalty = slippage_months / target_months
    return max(0.0, min(1.0, 1.0 - penalty))


def calculate_phi_dti(debt_payments: float, net_income: float) -> float:
    """
    Phi_dti component: Debt-to-income health.
    DTI = DebtPayments / NetIncome
    If DTI <= 0.15: 1.0
    If 0.15 < DTI < 0.50: 1.0 - (DTI - 0.15) / 0.35
    If DTI >= 0.50: 0.0
    """
    if net_income <= 0:
        return 0.0
    dti = debt_payments / net_income
    if dti <= 0.15:
        return 1.0
    elif dti >= 0.50:
        return 0.0
    else:
        return max(0.0, min(1.0, 1.0 - ((dti - 0.15) / 0.35)))


def compute_resilience_score(
    baseline: BaselineProfile,
    goal: GoalSpec,
    stressed_summary: StressedSimulationSummary
) -> Tuple[float, ResilienceGrade, Dict[str, float]]:
    """
    Computes the composite SaveSmart Resilience Score (0–100) under stressed conditions.
    Returns: (score, grade, components_breakdown)
    """
    fixed_exp = baseline.fixed_expenses.total
    disc_exp = baseline.discretionary_expenses.total

    phi_buffer = calculate_phi_buffer(
        stressed_summary.minimum_cash_buffer,
        fixed_exp,
        stressed_summary.insolvency_triggered
    )
    phi_flex = calculate_phi_flex(fixed_exp, disc_exp)
    phi_slip = calculate_phi_slip(stressed_summary.slippage_months, goal.target_months)
    phi_dti = calculate_phi_dti(baseline.total_debt_payment, baseline.monthly_net_income)

    composite_score = 100.0 * (
        (W_BUFFER * phi_buffer)
        + (W_FLEX * phi_flex)
        + (W_SLIP * phi_slip)
        + (W_DTI * phi_dti)
    )
    composite_score = round(max(0.0, min(100.0, composite_score)), 1)
    grade = get_resilience_grade(composite_score)

    components = {
        "phi_buffer": round(phi_buffer, 3),
        "phi_flex": round(phi_flex, 3),
        "phi_slip": round(phi_slip, 3),
        "phi_dti": round(phi_dti, 3),
        "resilience_score": composite_score
    }

    return (composite_score, grade, components)


def evaluate_baseline_goal_health(
    baseline: BaselineProfile,
    goal: GoalSpec
) -> GoalHealthReport:
    """
    Evaluates initial baseline goal durability and detects pre-existing financial fragilities.
    """
    fcf = compute_free_cash_flow(baseline)
    c_target = compute_required_monthly_contribution(goal)
    margin = round(fcf - c_target, 2)
    fixed_exp = baseline.fixed_expenses.total
    disc_exp = baseline.discretionary_expenses.total
    income = baseline.monthly_net_income

    # Baseline components (slippage = 0)
    phi_buffer = calculate_phi_buffer(baseline.emergency_fund_balance, fixed_exp, False)
    phi_flex = calculate_phi_flex(fixed_exp, disc_exp)
    phi_slip = 1.0  # Zero delay in baseline
    phi_dti = calculate_phi_dti(baseline.total_debt_payment, income)

    baseline_score = 100.0 * (
        (W_BUFFER * phi_buffer)
        + (W_FLEX * phi_flex)
        + (W_SLIP * phi_slip)
        + (W_DTI * phi_dti)
    )
    baseline_score = round(max(0.0, min(100.0, baseline_score)), 1)

    emergency_buffer_months = round(baseline.emergency_fund_balance / fixed_exp, 1) if fixed_exp > 0 else 0.0
    dti_ratio = round(baseline.total_debt_payment / income, 3) if income > 0 else 0.0

    risk_factors: List[HealthRiskFactor] = []

    # 1. Cash flow feasibility check
    if margin < 0:
        risk_factors.append(HealthRiskFactor(
            factor="cashflow_deficit",
            severity="HIGH",
            description=f"Goal monthly contribution (₹{c_target:,.2f}) exceeds free cash flow (₹{fcf:,.2f}) by ₹{abs(margin):,.2f}/month."
        ))
    elif margin < (0.10 * income):
        risk_factors.append(HealthRiskFactor(
            factor="tight_cashflow_margin",
            severity="MEDIUM",
            description=f"Free cash flow margin after goal contribution is narrow (₹{margin:,.2f}/month)."
        ))

    # 2. Emergency cushion check
    if emergency_buffer_months < 1.0:
        risk_factors.append(HealthRiskFactor(
            factor="emergency_buffer",
            severity="HIGH",
            description=f"Emergency cushion covers only {emergency_buffer_months} months of fixed living costs (minimum 3 months recommended)."
        ))
    elif emergency_buffer_months < 3.0:
        risk_factors.append(HealthRiskFactor(
            factor="emergency_buffer",
            severity="MEDIUM",
            description=f"Emergency cushion covers {emergency_buffer_months} months of fixed living expenses."
        ))

    # 3. Debt burden check
    if dti_ratio >= 0.40:
        risk_factors.append(HealthRiskFactor(
            factor="debt_burden",
            severity="HIGH",
            description=f"High debt-to-income ratio ({dti_ratio * 100:.1f}%), leaving little buffer for debt rate shocks."
        ))
    elif dti_ratio >= 0.25:
        risk_factors.append(HealthRiskFactor(
            factor="debt_burden",
            severity="MEDIUM",
            description=f"Moderate debt burden ({dti_ratio * 100:.1f}% of income allocated to debt obligations)."
        ))

    # 4. Spending flexibility check
    flex_ratio = disc_exp / (fixed_exp + disc_exp) if (fixed_exp + disc_exp) > 0 else 0.0
    if flex_ratio < 0.15:
        risk_factors.append(HealthRiskFactor(
            factor="low_budget_flexibility",
            severity="MEDIUM",
            description="Fixed obligations dominate your spending; limited room to absorb shocks through discretionary cuts."
        ))

    # Overall baseline health status
    if baseline_score >= 80.0 and margin >= 0:
        status = "HEALTHY"
    elif baseline_score >= 60.0 and margin >= 0:
        status = "MODERATE_RISK"
    else:
        status = "AT_RISK"

    return GoalHealthReport(
        goal_id=goal.goal_id,
        currency="INR",
        health_status=status,
        baseline_resilience_score=baseline_score,
        monthly_savings_rate=c_target,
        free_cash_flow_margin=margin,
        emergency_buffer_months=emergency_buffer_months,
        debt_to_income_ratio=dti_ratio,
        risk_factors=risk_factors
    )
