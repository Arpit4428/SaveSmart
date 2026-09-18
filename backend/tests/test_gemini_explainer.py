"""
SaveSmart Gemini Explainer & Hallucination Firewall Test Suite.
Verifies zero-hallucination guardrails, fallback explanations, and API endpoints.
All external Gemini API calls are mocked for deterministic, reliable, offline testing.
"""
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient

from app.schemas.explanation import AIExplanationStructured
from app.services.fallback_explainer import FallbackExplainer
from app.services.gemini_service import GeminiExplainerService
from app.services.hallucination_firewall import HallucinationFirewall
from main import app

client = TestClient(app)


@pytest.fixture
def anyio_backend():
    return "asyncio"

MOCK_VERIFIED_CONTEXT = {
    "goal_name": "Emergency Cushion & Down Payment",
    "target_amount": 1500000.0,
    "current_balance": 250000.0,
    "resilience_score": 62.0,
    "resilience_grade": "B",
    "free_cash_flow_margin": 28000.0,
    "emergency_buffer_months": 4.5,
    "debt_to_income_ratio": 0.22,
    "stressed": {
        "completion_month": 28,
        "slippage_months": 4,
        "capital_deficit": 180000.0,
        "minimum_cash_buffer": 45000.0,
        "buffer_exhausted": False,
    },
    "shocks_applied": [
        {
            "shock_type": "income_drop",
            "start_month": 3,
            "duration_months": 4,
            "magnitude_percent": 0.35,
            "amount": 0.0,
        }
    ],
}


def test_gemini_service_configuration_missing_key():
    """Verify service gracefully falls back when API key is missing."""
    service = GeminiExplainerService(api_key="")
    assert not service.is_configured()

    import asyncio
    explanation, is_fallback, model = asyncio.run(
        service.explain_scenario("stress_test", MOCK_VERIFIED_CONTEXT)
    )

    assert is_fallback is True
    assert model == "deterministic_fallback"
    assert isinstance(explanation, AIExplanationStructured)
    assert "62/100" in explanation.headline or "Grade B" in explanation.headline or "slippage" in explanation.headline.lower()
    assert len(explanation.key_drivers) >= 2


def test_deterministic_fallback_for_all_modes():
    """Verify deterministic fallback generates valid, structured explanations for all analytical modes."""
    modes = ["health", "stress_test", "cascade", "recovery", "survival"]
    for mode in modes:
        explanation = FallbackExplainer.generate_explanation(mode, MOCK_VERIFIED_CONTEXT)
        assert isinstance(explanation, AIExplanationStructured)
        assert len(explanation.headline) > 5
        assert len(explanation.summary) > 20
        assert len(explanation.key_drivers) > 0
        assert len(explanation.actionable_next_steps) > 0


def test_hallucination_firewall_passes_valid_numbers():
    """Verify firewall accepts structured output containing numbers from the verified context."""
    valid_explanation = AIExplanationStructured(
        headline="Stress shock delays goal by 4 months with a Resilience Score of 62/100.",
        summary="A 35% income reduction across 4 months creates a ₹1,80,000 capital deficit, drawing liquid reserves down to ₹45,000.",
        key_drivers=[
            "Target deadline slippage: +4 months",
            "Capital deficit at target deadline: ₹1,80,000",
            "Minimum liquid buffer level: ₹45,000"
        ],
        impact_assessment="Emergency reserves of ₹45,000 prevent default but force a 4-month extension.",
        trade_offs_explained="Timeline extension preserves cash flow without requiring additional high-interest debt.",
        actionable_next_steps=[
            "Adopt the recommended Balanced Recovery Plan to trim flexible expenses.",
            "Avoid high-interest consumer debt to finance the monthly cash gap."
        ]
    )

    is_valid, violations = HallucinationFirewall.validate(valid_explanation, MOCK_VERIFIED_CONTEXT)
    assert is_valid is True
    assert len(violations) == 0


def test_hallucination_firewall_catches_unsupported_numbers():
    """Verify firewall catches fabricated or hallucinated financial numbers not in the verified context."""
    hallucinated_explanation = AIExplanationStructured(
        headline="Your goal suffers an unverified ₹7,95,000 deficit.",
        summary="We forecast you will lose ₹89,500 every single week and have to pay an extra ₹4,35,000 in hidden penalties.",
        key_drivers=["Fake figure: ₹7,95,000", "Invented penalty: ₹4,35,000"],
        impact_assessment="Fabricated impact statement with ₹89,500 weekly outflow.",
        trade_offs_explained="Invented trade-off.",
        actionable_next_steps=["Step 1", "Step 2"]
    )

    is_valid, violations = HallucinationFirewall.validate(hallucinated_explanation, MOCK_VERIFIED_CONTEXT)
    assert is_valid is False
    assert any("unsupported numerical values" in v for v in violations)


def test_hallucination_firewall_catches_investment_advice():
    """Verify firewall rejects forbidden investment advice (stocks, crypto, mutual funds, loans)."""
    advice_explanation = AIExplanationStructured(
        headline="Resilience Score is 62/100 with a 4-month slippage.",
        summary="To fix this shortfall, you should invest in high-yield mutual funds and buy stocks immediately.",
        key_drivers=["Invest in stocks to bridge the ₹1,80,000 deficit"],
        impact_assessment="Buffer drawdown of ₹45,000.",
        trade_offs_explained="Trading cash for equity.",
        actionable_next_steps=["Take a loan to cover your expenses", "Buy cryptocurrency assets"]
    )

    is_valid, violations = HallucinationFirewall.validate(advice_explanation, MOCK_VERIFIED_CONTEXT)
    assert is_valid is False
    assert any("forbidden financial advice" in v for v in violations)


@pytest.mark.anyio
async def test_gemini_service_valid_mock_response():
    """Verify Gemini service returns parsed AI explanation when API response is valid and passes firewall."""
    service = GeminiExplainerService(api_key="mock_test_key", model="gemini-1.5-flash")

    mock_response_json = """{
        "headline": "Disruption causes 4-month deadline delay with 62/100 resilience score.",
        "summary": "A 35% income drop creates a ₹1,80,000 capital deficit while liquid reserves absorb the shock down to ₹45,000.",
        "key_drivers": ["4 months slippage", "₹1,80,000 deficit", "Minimum buffer ₹45,000"],
        "impact_assessment": "Liquid reserves prevented insolvency but delayed your target completion.",
        "trade_offs_explained": "Extending the deadline preserves standard of living.",
        "actionable_next_steps": ["Review the Balanced Recovery Plan", "Avoid high-interest loans"]
    }"""

    mock_client = MagicMock()
    mock_gen_response = MagicMock()
    mock_gen_response.text = mock_response_json
    mock_client.models.generate_content.return_value = mock_gen_response

    with patch("google.genai.Client", return_value=mock_client):
        explanation, is_fallback, model = await service.explain_scenario(
            "stress_test", MOCK_VERIFIED_CONTEXT
        )

        assert is_fallback is False
        assert model == "gemini-1.5-flash"
        assert "4-month" in explanation.headline or "62/100" in explanation.headline
        assert len(explanation.key_drivers) == 3


@pytest.mark.anyio
async def test_gemini_service_firewall_intercept_triggers_fallback():
    """Verify Gemini service automatically serves safe fallback when Gemini hallucinates unsupported numbers."""
    service = GeminiExplainerService(api_key="mock_test_key")

    mock_hallucinated_json = """{
        "headline": "Critical shock triggers ₹9,99,999 unexpected loss.",
        "summary": "You must invest in stocks immediately to cover the ₹9,99,999 loss.",
        "key_drivers": ["Take a loan of ₹8,88,888"],
        "impact_assessment": "Unverified loss.",
        "trade_offs_explained": "Risking assets.",
        "actionable_next_steps": ["Buy crypto"]
    }"""

    mock_client = MagicMock()
    mock_gen_response = MagicMock()
    mock_gen_response.text = mock_hallucinated_json
    mock_client.models.generate_content.return_value = mock_gen_response

    with patch("google.genai.Client", return_value=mock_client):
        explanation, is_fallback, model = await service.explain_scenario(
            "stress_test", MOCK_VERIFIED_CONTEXT
        )

        # Firewall must intercept and trigger fallback
        assert is_fallback is True
        assert "fallback" in model
        assert isinstance(explanation, AIExplanationStructured)
        assert "invest in stocks" not in explanation.summary.lower()


@pytest.mark.anyio
async def test_gemini_service_api_error_triggers_fallback():
    """Verify Gemini service handles API timeout, network error, or malformed JSON gracefully without crashing."""
    service = GeminiExplainerService(api_key="mock_test_key")

    mock_client = MagicMock()
    mock_client.models.generate_content.side_effect = TimeoutError("Gemini API request timed out after 10000ms")

    with patch("google.genai.Client", return_value=mock_client):
        explanation, is_fallback, model = await service.explain_scenario(
            "stress_test", MOCK_VERIFIED_CONTEXT
        )

        assert is_fallback is True
        assert model == "deterministic_fallback"
        assert isinstance(explanation, AIExplanationStructured)


def test_explain_endpoint_full_lifecycle():
    """Test POST /api/v1/explain/scenario creates a verified explanation for an existing goal."""
    # 1. Create a Goal first
    goal_payload = {
        "name": "Gemini Verification House Goal",
        "category": "housing",
        "target_amount": 1000000.0,
        "current_balance": 200000.0,
        "target_months": 24,
        "priority": "high"
    }
    create_res = client.post("/api/v1/goals", json=goal_payload)
    assert create_res.status_code == 201
    goal_id = create_res.json()["data"]["id"]

    # 2. Save a Baseline
    baseline_payload = {
        "monthly_net_income": 120000.0,
        "fixed_expenses": {
            "rent_or_mortgage": 35000.0,
            "utilities": 5000.0,
            "insurance": 3000.0,
            "subscriptions_and_bills": 2000.0
        },
        "discretionary_expenses": {
            "dining_out": 8000.0,
            "entertainment": 4000.0,
            "shopping": 5000.0,
            "other": 3000.0
        },
        "debt_commitments": [],
        "emergency_fund_balance": 300000.0
    }
    base_res = client.post("/api/v1/baseline", json=baseline_payload)
    assert base_res.status_code in (200, 201)

    # 3. Request Explanation for stress test
    explain_req = {
        "goal_id": goal_id,
        "explanation_type": "stress_test",
        "shocks": [
            {
                "shock_type": "income_drop",
                "start_month": 2,
                "duration_months": 3,
                "magnitude_percent": 0.35,
                "description": "Furlough disruption"
            }
        ],
        "horizon_months": 36
    }
    res = client.post("/api/v1/explain/scenario", json=explain_req)
    assert res.status_code == 200
    data = res.json()["data"]

    # Verify separation of deterministic math vs AI explanation
    assert data["goal_id"] == goal_id
    assert data["currency"] == "INR"
    assert "verified_financial_result" in data
    assert "ai_explanation" in data
    assert data["verified_financial_result"]["resilience_score"] > 0
    assert len(data["ai_explanation"]["headline"]) > 0
    assert len(data["ai_explanation"]["actionable_next_steps"]) > 0
    assert "deterministic" in data["disclaimer"].lower()
