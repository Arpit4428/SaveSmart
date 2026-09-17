"""
API Tests for SaveSmart Financial Baseline Endpoints
Verifies Profile saving, fetching, and Financial Engine deterministic calculations.
"""
import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_baseline_save_and_retrieve(client):
    user_id = "test_user_baseline_01"

    payload = {
        "user_id": user_id,
        "monthly_net_income": 120000.0,
        "fixed_expenses": {
            "rent_or_mortgage": 35000.0,
            "utilities": 6000.0,
            "insurance": 4000.0,
            "subscriptions_and_bills": 3000.0
        },
        "discretionary_expenses": {
            "dining_out": 10000.0,
            "entertainment": 5000.0,
            "shopping": 8000.0,
            "other": 3000.0
        },
        "debt_commitments": [
            {
                "name": "Auto Loan",
                "monthly_payment": 12500.0,
                "remaining_balance": 380000.0,
                "interest_rate_annual": 0.085,
                "is_variable_rate": True
            }
        ],
        "emergency_fund_balance": 150000.0
    }

    # 1. Save baseline
    post_res = client.post("/api/v1/baseline", json=payload)
    assert post_res.status_code == 200
    res_data = post_res.json()
    assert res_data["success"] is True
    profile = res_data["data"]

    # Verify deterministic summary values produced by the Financial Engine
    summary = profile["summary"]
    # Total fixed = 35000 + 6000 + 4000 + 3000 = 48000
    assert summary["total_fixed_expenses"] == 48000.0
    # Total discretionary = 10000 + 5000 + 8000 + 3000 = 26000
    assert summary["total_discretionary_expenses"] == 26000.0
    # Total debt = 12500
    assert summary["total_debt_payments"] == 12500.0
    # Net FCF = 120,000 - (48,000 + 26,000 + 12,500) = 33,500
    assert summary["net_free_cash_flow"] == 33500.0
    # Savings capacity = (33500 / 120000) * 100 = 27.9%
    assert summary["savings_capacity_percent"] == 27.9

    # 2. Get baseline
    get_res = client.get(f"/api/v1/baseline?user_id={user_id}")
    assert get_res.status_code == 200
    fetched_data = get_res.json()["data"]
    assert fetched_data["user_id"] == user_id
    assert fetched_data["monthly_net_income"] == 120000.0
    assert fetched_data["summary"]["net_free_cash_flow"] == 33500.0


def test_baseline_not_found(client):
    res = client.get("/api/v1/baseline?user_id=nonexistent_user_9999")
    assert res.status_code == 404
    err_json = res.json()
    assert err_json["success"] is False
    assert err_json["error"]["code"] == "RESOURCE_NOT_FOUND"
