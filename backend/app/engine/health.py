"""
SaveSmart Financial Engine — Health Scoring & Resilience Evaluation
Pure deterministic mathematical scoring producing the SaveSmart Resilience Score (0–100),
risk factors, and resilience grade classification.
All calculations denominated in Indian Rupees (INR / ₹).
"""
from typing import Dict, List, Optional, Tuple
from .models import (
    BaselineProfile,
    FailureDiagnostic,
    GoalHealthReport,
    GoalSpec,
    HealthRiskFactor,
    MonthlySnapshot,
    ResilienceFingerprint,
    ResilienceGrade,
    ShockEvent,
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

    # Compute baseline Resilience Fingerprint
    fingerprint = compute_resilience_fingerprint(baseline, goal)

    return GoalHealthReport(
        goal_id=goal.goal_id,
        currency="INR",
        health_status=status,
        baseline_resilience_score=baseline_score,
        monthly_savings_rate=c_target,
        free_cash_flow_margin=margin,
        emergency_buffer_months=emergency_buffer_months,
        debt_to_income_ratio=dti_ratio,
        risk_factors=risk_factors,
        resilience_fingerprint=fingerprint
    )


def compute_resilience_fingerprint(
    baseline: BaselineProfile,
    goal: GoalSpec,
    min_buffer_balance: float = None,
    slippage_months: int = None,
    insolvency_triggered: bool = False
) -> ResilienceFingerprint:
    """
    Computes the 5-axis Financial Resilience Fingerprint deterministically
    according to Section 5.6 of FINANCIAL_RULES.md.
    """
    fixed_exp = baseline.fixed_expenses.total
    disc_exp = baseline.discretionary_expenses.total
    net_income = baseline.monthly_net_income
    debt_payments = baseline.total_debt_payment
    fcf = baseline.net_free_cash_flow
    c_target = compute_required_monthly_contribution(goal)

    eff_buffer = min_buffer_balance if min_buffer_balance is not None else baseline.emergency_fund_balance
    eff_slip = slippage_months if slippage_months is not None else 0

    # 1. Buffer Strength (0-100)
    phi_buf = calculate_phi_buffer(eff_buffer, fixed_exp, insolvency_triggered)
    s_buf = round(phi_buf * 100.0, 1)

    # 2. Cash-flow Flexibility (0-100)
    phi_flx = calculate_phi_flex(fixed_exp, disc_exp)
    s_flex = round(phi_flx * 100.0, 1)

    # 3. Debt Pressure Safety (0-100)
    phi_debt = calculate_phi_dti(debt_payments, net_income)
    s_debt = round(phi_debt * 100.0, 1)

    # 4. Goal Capacity Cushion (0-100)
    if c_target <= 0 or fcf <= 0:
        s_cap = 100.0 if c_target <= 0 and fcf >= 0 else 0.0
    else:
        coverage_ratio = fcf / c_target
        if coverage_ratio >= 2.0:
            s_cap = 100.0
        elif coverage_ratio <= 1.0:
            s_cap = 0.0
        else:
            s_cap = round((coverage_ratio - 1.0) * 100.0, 1)

    # 5. Shock Recovery Velocity (0-100)
    phi_slp = calculate_phi_slip(eff_slip, goal.target_months)
    s_rec = round(phi_slp * 100.0, 1)

    # Composite mean
    overall = round((s_buf + s_flex + s_debt + s_cap + s_rec) / 5.0, 1)
    grade = get_resilience_grade(overall).value

    return ResilienceFingerprint(
        buffer_strength=s_buf,
        cashflow_flexibility=s_flex,
        debt_pressure_safety=s_debt,
        goal_capacity_cushion=s_cap,
        shock_recovery_velocity=s_rec,
        overall_score=overall,
        overall_grade=grade
    )


def diagnose_goal_failure(
    baseline: BaselineProfile,
    goal: GoalSpec,
    shocks: List[ShockEvent],
    stressed_summary: StressedSimulationSummary,
    snapshots: List[MonthlySnapshot]
) -> FailureDiagnostic:
    """
    Deterministically computes 'Why Did My Goal Fail?' analytical breakdown
    without LLM fabrication or statistical drift (FINANCIAL_RULES.md Section 5.7).
    """
    c_target = compute_required_monthly_contribution(goal)
    base_fcf = baseline.net_free_cash_flow
    b0 = baseline.emergency_fund_balance

    # Identify shock active snapshots
    shocked_snaps = [s for s in snapshots if s.is_shock_active]
    min_fcf = min((s.free_cash_flow for s in shocked_snaps), default=base_fcf)
    min_contrib = min((s.goal_contribution for s in shocked_snaps), default=c_target)

    cashflow_drop = max(0.0, round(base_fcf - min_fcf, 2))
    contrib_drop = max(0.0, round(c_target - min_contrib, 2))
    buffer_drained = max(0.0, round(b0 - stressed_summary.minimum_cash_buffer, 2))

    # Determine headline and root causes
    if stressed_summary.insolvency_triggered:
        headline = "WHY YOUR GOAL TRIGGERED INSOLVENCY"
        primary_vuln = "Critical Emergency Buffer Exhaustion"
    elif stressed_summary.slippage_months > 6:
        headline = "WHY YOUR GOAL BECAME SEVERELY DELAYED"
        primary_vuln = "Deep Cash Flow Compression"
    elif stressed_summary.capital_deficit > 0:
        headline = "WHY YOUR GOAL ACCUMULATED A CAPITAL DEFICIT"
        primary_vuln = "Interrupted Savings Velocity"
    else:
        headline = "WHY YOUR GOAL SURVIVED WITH RESILIENCE"
        primary_vuln = "Sufficient Absorption Cushion"

    root_causes: List[str] = []

    # 1. Shock Magnitude
    if shocks:
        shock_desc = ", ".join(s.description or s.shock_type.value for s in shocks[:2])
        root_causes.append(f"Financial shock ({shock_desc}) disrupted baseline cash flow for {sum(s.duration_months for s in shocks)} cumulative months.")
    else:
        root_causes.append("Baseline financial parameters maintained without external shocks.")

    # 2. Monthly FCF Drop
    root_causes.append(f"Monthly free cash flow contracted by ₹{cashflow_drop:,.2f}/month (dropped from ₹{base_fcf:,.2f} to ₹{min_fcf:,.2f}).")

    # 3. Buffer Absorption
    if buffer_drained > 0:
        root_causes.append(f"Emergency cushion absorbed ₹{buffer_drained:,.2f} in cumulative deficits (minimum buffer remaining: ₹{stressed_summary.minimum_cash_buffer:,.2f}).")
    else:
        root_causes.append("Emergency fund remained untouched; cash flow remained non-negative throughout shock window.")

    # 4. Goal Contribution Curtailment
    if contrib_drop > 0:
        root_causes.append(f"Monthly goal savings curtailed by ₹{contrib_drop:,.2f}/month (from ₹{c_target:,.2f} down to ₹{min_contrib:,.2f}) to safeguard essential living costs.")
    else:
        root_causes.append(f"Full monthly goal contribution of ₹{c_target:,.2f} was preserved without reduction.")

    # 5. Timeline Slippage & Shortfall
    if stressed_summary.slippage_months > 0:
        root_causes.append(f"Target deadline delayed by {stressed_summary.slippage_months} months with ₹{stressed_summary.capital_deficit:,.2f} capital shortfall at original {goal.target_months}-month horizon.")
    else:
        root_causes.append(f"Goal remained on track for completion within original {goal.target_months}-month horizon.")

    return FailureDiagnostic(
        headline=headline,
        root_causes=root_causes,
        primary_vulnerability=primary_vuln,
        contribution_drop_monthly=contrib_drop,
        cashflow_drop_monthly=cashflow_drop,
        buffer_absorbed_total=buffer_drained,
        deadline_slippage_months=stressed_summary.slippage_months,
        capital_loss_at_deadline=stressed_summary.capital_deficit
    )

