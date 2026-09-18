"""
SaveSmart Deterministic Fallback Explainer.
Generates structured, natural-language explanations derived 100% deterministically from
verified Python financial engine outputs whenever Gemini is disabled, times out, or fails validation.
"""
from typing import Any, Dict, List
from app.schemas.explanation import AIExplanationStructured


def _format_inr(val: float) -> str:
    """Formats a numeric value as INR (₹)."""
    try:
        val_int = int(round(val))
        is_negative = val_int < 0
        s = str(abs(val_int))
        if len(s) <= 3:
            res = s
        else:
            last3 = s[-3:]
            remaining = s[:-3]
            chunks = []
            while len(remaining) > 2:
                chunks.insert(0, remaining[-2:])
                remaining = remaining[:-2]
            if remaining:
                chunks.insert(0, remaining)
            res = ",".join(chunks) + "," + last3
        return f"-₹{res}" if is_negative else f"₹{res}"
    except Exception:
        return f"₹{val:,.2f}"


class FallbackExplainer:
    """
    Deterministic rule-based explanation engine.
    Ensures safe, accurate explanations directly grounded in verified calculations.
    """

    @classmethod
    def generate_explanation(
        cls,
        explanation_type: str,
        verified_data: Dict[str, Any],
        custom_question: str = None
    ) -> AIExplanationStructured:
        """
        Generates an AIExplanationStructured instance based on verified data.
        """
        if explanation_type == "health":
            return cls._explain_health(verified_data)
        elif explanation_type == "cascade":
            return cls._explain_cascade(verified_data)
        elif explanation_type == "recovery":
            return cls._explain_recovery(verified_data)
        elif explanation_type == "survival":
            return cls._explain_survival(verified_data)
        else:
            return cls._explain_stress_test(verified_data)

    @classmethod
    def _explain_health(cls, data: Dict[str, Any]) -> AIExplanationStructured:
        score = data.get("baseline_resilience_score", 0)
        status = data.get("health_status", "MODERATE_RISK")
        fcf = data.get("free_cash_flow_margin", 0)
        buffer_months = data.get("emergency_buffer_months", 0)
        dti = data.get("debt_to_income_ratio", 0) * 100.0
        risk_factors = data.get("risk_factors", [])

        headline = f"Goal evaluated with {status.replace('_', ' ')} health (Resilience Score: {score}/100)."

        summary = (
            f"Your baseline financial capacity demonstrates a monthly free cash flow margin of {_format_inr(fcf)}. "
            f"Your current liquid emergency fund covers {buffer_months:.1f} months of fixed living obligations, "
            f"while committed debt servicing accounts for {dti:.1f}% of your monthly income."
        )

        key_drivers = [
            f"Monthly Free Cash Flow headroom: {_format_inr(fcf)}",
            f"Liquid Emergency Buffer runway: {buffer_months:.1f} months",
            f"Debt-to-Income pressure: {dti:.1f}% of net earnings"
        ]

        if risk_factors:
            for rf in risk_factors[:2]:
                desc = rf.get("description", "")
                if desc:
                    key_drivers.append(f"Identified Vulnerability: {desc}")

        impact_assessment = (
            "Under baseline economic conditions, your cash flow is sufficient to maintain your required savings rate. "
            f"However, maintaining less than 6 months of liquid reserves creates vulnerability to unexpected disruptions."
            if buffer_months < 6.0 else
            "Your liquid buffer is robust, providing strong initial protection against external shocks."
        )

        next_steps = [
            "Maintain current savings discipline to protect your free cash flow margin.",
            f"Prioritize building emergency reserves toward the recommended 6-month benchmark of fixed living costs."
            if buffer_months < 6.0 else "Continue directing surplus cash flow toward scheduled goal milestones.",
            "Test your baseline against realistic stress shocks in the Stress-Test Lab to identify hidden cliff-edges."
        ]

        return AIExplanationStructured(
            headline=headline,
            summary=summary,
            key_drivers=key_drivers,
            impact_assessment=impact_assessment,
            trade_offs_explained="Balancing aggressive goal contributions against liquid buffer accumulation.",
            actionable_next_steps=next_steps
        )

    @classmethod
    def _explain_stress_test(cls, data: Dict[str, Any]) -> AIExplanationStructured:
        score = data.get("resilience_score", 0)
        grade = data.get("resilience_grade", "C")
        stressed = data.get("stressed", {})
        slippage = stressed.get("slippage_months", 0)
        shortfall = stressed.get("capital_deficit", 0)
        min_buffer = stressed.get("minimum_cash_buffer", 0)
        buffer_exhausted = stressed.get("buffer_exhausted", False)
        diagnostic = data.get("failure_diagnostic") or {}

        headline = (
            f"Stress shock degrades Goal Resilience to {score}/100 (Grade {grade}), delaying completion by {slippage} months."
        )

        summary = (
            f"The simulated financial disruption triggers a {_format_inr(shortfall)} capital shortfall at your original target deadline. "
            f"To absorb the cash-flow deficit, emergency reserves were drawn down to a minimum level of {_format_inr(min_buffer)}. "
            f"{'Your emergency cushion was fully exhausted, forcing savings contributions to zero.' if buffer_exhausted else 'Your emergency buffer prevented critical insolvency but forced delayed contributions.'}"
        )

        key_drivers = [
            f"Target deadline slippage: +{slippage} months",
            f"Capital shortfall at deadline: {_format_inr(shortfall)}",
            f"Minimum liquid buffer level: {_format_inr(min_buffer)}",
        ]

        if diagnostic.get("primary_vulnerability"):
            key_drivers.append(f"Primary Vulnerability Driver: {diagnostic.get('primary_vulnerability')}")

        impact_assessment = (
            f"The contraction in net cash flow required diverting funds away from goal accumulation. "
            f"Completion milestone slips from the original timeline by {slippage} months unless recovery actions are taken."
        )

        trade_offs = (
            "Absorbing the disruption via timeline delay preserves day-to-day discretionary spending, "
            "whereas maintaining the deadline requires immediate budget reductions."
        )

        next_steps = [
            "Review the Adaptive Recovery Planner to explore Balanced vs. Aggressive spending reduction options.",
            "Avoid taking high-interest debt to fund the monthly deficit.",
            "Temporarily reduce discretionary spending during the active disruption months to preserve liquid reserves."
        ]

        return AIExplanationStructured(
            headline=headline,
            summary=summary,
            key_drivers=key_drivers,
            impact_assessment=impact_assessment,
            trade_offs_explained=trade_offs,
            actionable_next_steps=next_steps
        )

    @classmethod
    def _explain_cascade(cls, data: Dict[str, Any]) -> AIExplanationStructured:
        score = data.get("resilience_score", 0)
        insolvent = data.get("cascade_triggered_insolvency", False)
        insolvency_month = data.get("insolvency_first_month")
        peak_deficit = data.get("peak_deficit", 0)
        steps = data.get("chain_reaction_steps") or []
        diagnostic = data.get("failure_diagnostic") or {}

        headline = (
            f"Cascading multi-shock sequence triggers {'critical insolvency' if insolvent else 'severe stress'} (Resilience Score: {score}/100)."
        )

        summary = (
            f"A multi-shock crisis compounds non-linearly. The initial disruption drains the liquid safety buffer, "
            f"leaving your cash flow vulnerable when the secondary shock hits. "
            f"{f'Insolvency was triggered in Month {insolvency_month} with a peak deficit of {_format_inr(peak_deficit)}.' if insolvent else 'Although default was avoided, emergency reserves were severely depleted.'}"
        )

        key_drivers = [
            f"Compound Resilience Score: {score}/100",
            f"Sequenced disruption events: {len(steps)} transmission steps",
            f"Insolvency Status: {'Critical Deficit in Month ' + str(insolvency_month) if insolvent else 'Buffer Preserved'}",
            f"Peak Cash Flow Deficit: {_format_inr(peak_deficit)}"
        ]

        if diagnostic.get("primary_vulnerability"):
            key_drivers.append(f"Root Vulnerability: {diagnostic.get('primary_vulnerability')}")

        impact_assessment = (
            "The secondary shock compounded catastrophic loss because the emergency cushion had already been depleted "
            "by the primary shock. Monthly contributions were forced to zero to avoid structural debt."
        )

        trade_offs = (
            "Multi-shock crises require a combination of timeline extension and immediate discretionary austerity "
            "to rebuild the first line of defense."
        )

        next_steps = [
            "Activate the Balanced Recovery Plan immediately to protect core liquid reserves.",
            "Prioritize restoring emergency fund balance before resuming standard goal contribution amounts.",
            "Establish an auxiliary contingency buffer to absorb multi-shock compounding risks."
        ]

        return AIExplanationStructured(
            headline=headline,
            summary=summary,
            key_drivers=key_drivers,
            impact_assessment=impact_assessment,
            trade_offs_explained=trade_offs,
            actionable_next_steps=next_steps
        )

    @classmethod
    def _explain_recovery(cls, data: Dict[str, Any]) -> AIExplanationStructured:
        plans = data.get("plans") or []
        balanced_plan = next((p for p in plans if p.get("plan_id") == "balanced"), plans[0] if plans else {})

        cut_pct = balanced_plan.get("discretionary_cut_percent", 0) * 100.0
        freed = balanced_plan.get("discretionary_savings_monthly", 0)
        adj_contrib = balanced_plan.get("monthly_contribution_adjusted", 0)
        slippage = balanced_plan.get("slippage_months", 0)
        buffer_preserved = balanced_plan.get("buffer_preserved", 0)

        headline = (
            f"Balanced Recovery restores goal feasibility with a moderate {cut_pct:.0f}% discretionary spending reduction."
        )

        summary = (
            f"The deterministic recovery solver generated 3 calibrated pathways. The recommended Balanced Plan trims "
            f"{_format_inr(freed)} per month from flexible spending while adjusting your timeline by +{slippage} months. "
            f"This preserves {_format_inr(buffer_preserved)} in liquid reserves to safeguard against further disruption."
        )

        key_drivers = [
            f"Recommended strategy: {balanced_plan.get('name', 'Balanced Recovery')}",
            f"Monthly budget freed: {_format_inr(freed)}/mo ({cut_pct:.0f}% discretionary cut)",
            f"Adjusted monthly savings contribution: {_format_inr(adj_contrib)}/mo",
            f"Timeline delay: +{slippage} months",
            f"Liquid buffer preserved: {_format_inr(buffer_preserved)}"
        ]

        impact_assessment = (
            "Comparing pathways: The Aggressive Plan eliminates timeline slippage through severe budget cuts, "
            "while the Extended Plan requires zero lifestyle changes but delays completion significantly. "
            "The Balanced Plan optimizes resilience and lifestyle sustainability."
        )

        trade_offs = balanced_plan.get("trade_offs") or (
            "Trading a modest 1-3 month deadline extension for sustainable lifestyle continuity."
        )

        next_steps = [
            f"Implement monthly discretionary spending limit to free {_format_inr(freed)} each month.",
            f"Set monthly savings auto-transfer to the adjusted {_format_inr(adj_contrib)}.",
            "Re-evaluate goal trajectory after 3 months of recovery discipline."
        ]

        return AIExplanationStructured(
            headline=headline,
            summary=summary,
            key_drivers=key_drivers,
            impact_assessment=impact_assessment,
            trade_offs_explained=trade_offs,
            actionable_next_steps=next_steps
        )

    @classmethod
    def _explain_survival(cls, data: Dict[str, Any]) -> AIExplanationStructured:
        verdict = data.get("survival_verdict") or "Goal survival analysis computed."
        status = data.get("final_status", "ANALYZED")
        first_unsafe = data.get("first_unsafe_month")
        drawdown = data.get("max_drawdown", 0)
        shortfall = data.get("capital_shortfall", 0)
        slippage = data.get("deadline_slippage", 0)
        recovery_pt = data.get("recovery_point_month")

        headline = f"Goal Survival Map Verdict: {status} ({verdict})"

        summary = (
            f"Across the multi-scenario survival projection, your goal status is classified as {status}. "
            f"The peak capital drawdown reaches {_format_inr(drawdown)} relative to baseline accumulation. "
            f"{f'Emergency buffer breaches safe threshold in Month {first_unsafe}.' if first_unsafe else 'Liquid reserves maintain safe operational margins throughout.'} "
            f"{f'Balanced recovery achieves parity with baseline at Month {recovery_pt}.' if recovery_pt else 'Recovery catch-up occurs beyond the 36-month horizon.'}"
        )

        key_drivers = [
            f"Survival Status: {status}",
            f"First Unsafe Month: {f'Month {first_unsafe}' if first_unsafe else 'None (Safely Maintained)'}",
            f"Maximum Capital Drawdown: {_format_inr(drawdown)}",
            f"Unmitigated Deadline Slippage: +{slippage} months",
            f"Capital Shortfall at Target Deadline: {_format_inr(shortfall)}"
        ]

        impact_assessment = (
            "The Goal Survival Map illustrates the difference between unmitigated shock progression and "
            "structured recovery intervention. Without intervention, capital accumulation stalls during shock months."
        )

        trade_offs = (
            "Deploying balanced recovery early minimizes cumulative drawdown and accelerates target achievement."
        )

        next_steps = [
            "Monitor emergency buffer levels to ensure they stay above the safe threshold floor.",
            "Execute the recommended Balanced Plan to restore target parity by the projected recovery milestone.",
            "Regularly re-run the Goal Survival Map as actual monthly balances are recorded."
        ]

        return AIExplanationStructured(
            headline=headline,
            summary=summary,
            key_drivers=key_drivers,
            impact_assessment=impact_assessment,
            trade_offs_explained=trade_offs,
            actionable_next_steps=next_steps
        )
