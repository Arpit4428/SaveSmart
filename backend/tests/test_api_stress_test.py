"""
API Tests for SaveSmart Stress-Test, Recovery, and Survival Map Endpoints
"""
import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def test_goal_id(client):
    goal_payload = {
        "user_id": "test_user_sim_01",
        "name": "Sim Goal Test",
        "category": "housing",
        "target_amount": 500000.0,
        "current_balance": 100000.0,
        "target_months": 20,
        "priority": "high"
    }
    res = client.post("/api/v1/goals", json=goal_payload)
    assert res.status_code == 201
    return res.json()["data"]["id"]


def test_simulate_single_shock_endpoint(client, test_goal_id):
    payload = {
        "goal_id": test_goal_id,
        "shock": {
            "shock_type": "income_drop",
            "start_month": 3,
            "duration_months": 3,
            "magnitude_percent": 0.35,
            "description": "Furlough"
        },
        "horizon_months": 30
    }
    res = client.post("/api/v1/stress-test/simulate", json=payload)
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["goal_id"] == test_goal_id
    assert data["currency"] == "INR"
    assert 0.0 <= data["resilience_score"] <= 100.0
    assert "baseline" in data
    assert "resilience_fingerprint" in data
    assert "failure_diagnostic" in data
    assert "assumption_ledger" in data
    assert len(data["chain_reaction_steps"]) > 0


def test_simulate_cascade_shocks_endpoint(client, test_goal_id):
    payload = {
        "goal_id": test_goal_id,
        "sequence_name": "Compound Emergency",
        "shocks": [
            {
                "shock_type": "income_drop",
                "start_month": 2,
                "duration_months": 3,
                "magnitude_percent": 0.40
            },
            {
                "shock_type": "lump_sum_expense",
                "start_month": 3,
                "amount": 100000.0
            }
        ],
        "horizon_months": 30
    }
    res = client.post("/api/v1/stress-test/cascade", json=payload)
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["goal_id"] == test_goal_id
    assert "resilience_score" in data
    assert "cascade_triggered_insolvency" in data
    assert "chain_reaction_steps" in data
    assert len(data["chain_reaction_steps"]) == 4  # baseline + 2 shocks + outcome


def test_recovery_plans_endpoint(client, test_goal_id):
    payload = {
        "goal_id": test_goal_id,
        "shocks": [
            {
                "shock_type": "income_drop",
                "start_month": 2,
                "duration_months": 3,
                "magnitude_percent": 0.35
            }
        ]
    }
    res = client.post("/api/v1/recovery/plans", json=payload)
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["goal_id"] == test_goal_id
    assert len(data["plans"]) == 3
    plan_ids = [p["plan_id"] for p in data["plans"]]
    assert "aggressive" in plan_ids
    assert "balanced" in plan_ids
    assert "extended" in plan_ids
    assert "curves" in data
    assert "assumption_ledger" in data
    for p in data["plans"]:
        assert len(p["trajectory_curve"]) > 0
        assert len(p["pros"]) > 0
        assert len(p["trade_offs"]) > 0


def test_survival_map_endpoint(client, test_goal_id):
    payload = {
        "goal_id": test_goal_id,
        "shocks": [],
        "horizon_months": 24
    }
    res = client.post("/api/v1/survival/map", json=payload)
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["goal_id"] == test_goal_id
    assert "curves" in data
    assert "baseline" in data["curves"]
    assert "stressed" in data["curves"]
    assert "recovered_balanced" in data["curves"]
    assert "target_amount" in data
    assert "final_status" in data
    assert "survival_verdict" in data
    assert "assumption_ledger" in data

