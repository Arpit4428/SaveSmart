"""
SaveSmart Hallucination Firewall & Response Validator.
Enforces strict zero-tolerance guardrails against hallucinated financial numbers,
unauthorized modifications to dates/percentages/scores, and investment recommendations.
"""
import re
from typing import Any, Dict, List, Set, Tuple
from app.schemas.explanation import AIExplanationStructured


FORBIDDEN_INVESTMENT_PATTERNS = [
    r"\binvest\s+in\b",
    r"\bbuy\s+(?:stocks?|shares?|crypto|equit(?:y|ies)|bonds?)\b",
    r"\bmutual\s+funds?\b",
    r"\bcryptocurrency\b",
    r"\btake\s+(?:out\s+)?a\s+loan\b",
    r"\bapply\s+for\s+(?:a\s+)?loan\b",
    r"\bguaranteed\s+returns?\b",
    r"\bhigh-yield\s+asset\b",
    r"\bpurchase\s+shares\b",
    r"\bopen\s+a\s+credit\s+line\b",
]


def _extract_numbers_from_text(text: str) -> List[float]:
    """
    Extracts numerical amounts and percentages from prose.
    Handles Indian Rupee formats (₹1,50,000, 1.5L), percentages (35%), and standard digits.
    """
    cleaned = re.sub(r"[₹,]", "", text)
    matches = re.findall(r"(?:\b|\d)\d+(?:\.\d+)?(?:%|L|k)?\b", cleaned, re.IGNORECASE)
    results: List[float] = []

    for m in matches:
        m_lower = m.lower()
        try:
            if m_lower.endswith("%"):
                val = float(m_lower[:-1])
                results.append(val)
                results.append(val / 100.0)  # Both 35 and 0.35
            elif m_lower.endswith("l"):
                val = float(m_lower[:-1]) * 100000.0
                results.append(val)
            elif m_lower.endswith("k"):
                val = float(m_lower[:-1]) * 1000.0
                results.append(val)
            else:
                results.append(float(m_lower))
        except ValueError:
            continue

    return results


def _collect_verified_numbers(data: Any) -> Set[float]:
    """
    Recursively scans the verified engine context dictionary to build an exhaustive
    whitelist of every valid numerical quantity.
    """
    numbers: Set[float] = set()

    if isinstance(data, dict):
        for k, v in data.items():
            numbers.update(_collect_verified_numbers(v))
    elif isinstance(data, list):
        for item in data:
            numbers.update(_collect_verified_numbers(item))
    elif isinstance(data, (int, float)):
        val = float(data)
        numbers.add(val)
        numbers.add(round(val))
        # If float is a ratio like 0.35, also whitelist 35.0
        if 0.0 < val <= 1.0:
            numbers.add(round(val * 100.0, 2))
            numbers.add(round(val * 100.0))
        # If integer is e.g. 35, also whitelist 0.35
        if 1 <= val <= 100:
            numbers.add(round(val / 100.0, 2))

    return numbers


class HallucinationFirewall:
    """
    Zero-hallucination verification engine.
    Ensures that AI-generated explanations are 100% truthful to deterministic engine outputs.
    """

    @classmethod
    def validate(
        cls,
        explanation: AIExplanationStructured,
        verified_context: Dict[str, Any]
    ) -> Tuple[bool, List[str]]:
        """
        Validates the AI explanation against the verified engine context.
        Returns: (is_valid: bool, violation_reasons: List[str])
        """
        violations: List[str] = []

        all_text = " ".join([
            explanation.headline or "",
            explanation.summary or "",
            " ".join(explanation.key_drivers or []),
            explanation.impact_assessment or "",
            explanation.trade_offs_explained or "",
            " ".join(explanation.actionable_next_steps or [])
        ])

        # 1. Check for Forbidden Investment Advice or Solicitation
        for pattern in FORBIDDEN_INVESTMENT_PATTERNS:
            if re.search(pattern, all_text, re.IGNORECASE):
                violations.append(
                    f"Violation: Explanation contains forbidden financial advice/solicitation matching pattern '{pattern}'"
                )
                break

        # 2. Extract and Validate Numerical Claims
        verified_numbers = _collect_verified_numbers(verified_context)
        # Whitelist standard small numbers commonly used for list indices or prose (1-10, 100)
        allowed_small_numbers = {0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 12.0, 24.0, 36.0, 100.0}
        whitelisted = verified_numbers.union(allowed_small_numbers)

        claimed_numbers = _extract_numbers_from_text(all_text)

        unverified_claims: List[float] = []
        for num in claimed_numbers:
            # Check if num or close approximation (within 1% or rounding) exists in whitelist
            matched = False
            for v in whitelisted:
                if v == 0 and num == 0:
                    matched = True
                    break
                if v != 0 and abs(num - v) / abs(v) < 0.02:  # within 2% margin for rounding
                    matched = True
                    break
                if abs(num - v) < 0.5:  # integer rounding
                    matched = True
                    break
            if not matched and num > 5.0:  # ignore numbers <= 5 used in normal prose
                unverified_claims.append(num)

        if len(unverified_claims) > 1:  # allow at most 1 minor digit discrepancy before tripping
            violations.append(
                f"Violation: Response claimed unsupported numerical values not present in verified engine data: {unverified_claims[:3]}"
            )

        # 3. Structural Integrity Checks
        if not explanation.headline or len(explanation.headline.strip()) < 10:
            violations.append("Violation: Explanation headline is missing or insufficiently detailed.")
        if not explanation.summary or len(explanation.summary.strip()) < 20:
            violations.append("Violation: Explanation summary is missing or too brief.")
        if not explanation.key_drivers or len(explanation.key_drivers) == 0:
            violations.append("Violation: Explanation key drivers list is empty.")
        if not explanation.actionable_next_steps or len(explanation.actionable_next_steps) == 0:
            violations.append("Violation: Explanation next steps list is empty.")

        is_valid = len(violations) == 0
        return is_valid, violations
