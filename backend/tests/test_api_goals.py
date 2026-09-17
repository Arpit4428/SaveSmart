"""
API Tests for SaveSmart Goal Endpoints
Verifies Goal CRUD operations and Financial Engine health calculation integration.
"""
import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_goal_crud_lifecycle(client):
    # 1. Create a goal
    goal_payload = {
        "user_id": "test_user_api",
        "name": "House Down Payment & Emergency Cushion",
        "category": "housing",
        "target_amount": 2500000.0,
        "current_balance": 450000.0,
        "target_months": 24,
        "priority": "high"
    }
    create_res = client.post("/api/v1/goals", json=goal_payload)
    assert create_res.status_code == 201
    created_data = create_res.json()
    assert created_data["success"] is True
    goal = created_data["data"]
    goal_id = goal["id"]
    assert goal["name"] == "House Down Payment & Emergency Cushion"
    assert goal["target_amount"] == 2500000.0
    # Required monthly contribution calculated by Financial Engine: (2,500,000 - 450,000) / 24 = 85,416.67
    assert goal["monthly_contribution"] == 85416.67

    # 2. Get the created goal
    get_res = client.get(f"/api/v1/goals/{goal_id}")
    assert get_res.status_code == 200
    fetched_data = get_res.json()
    assert fetched_data["data"]["id"] == goal_id

    # 3. List goals for user
    list_res = client.get("/api/v1/goals?user_id=test_user_api")
    assert list_res.status_code == 200
    goals_list = list_res.json()["data"]
    assert any(g["id"] == goal_id for g in goals_list)

    # 4. Update goal
    update_res = client.put(f"/api/v1/goals/{goal_id}", json={"current_balance": 500000.0})
    assert update_res.status_code == 200
    updated_goal = update_res.json()["data"]
    assert updated_goal["current_balance"] == 500000.0
    # Contribution recalculated: (2,500,000 - 500,000) / 24 = 83,333.33
    assert updated_goal["monthly_contribution"] == 83333.33

    # 5. Goal Health endpoint
    health_res = client.get(f"/api/v1/goals/{goal_id}/health")
    assert health_res.status_code == 200
    health_data = health_res.json()["data"]
    assert health_data["goal_id"] == goal_id
    assert health_data["currency"] == "INR"
    assert 0.0 <= health_data["baseline_resilience_score"] <= 100.0
    assert "health_status" in health_data

    # 6. Delete goal
    del_res = client.delete(f"/api/v1/goals/{goal_id}")
    assert del_res.status_code == 200
    assert del_res.json()["data"]["deleted"] is True

    # 7. Verify deletion
    not_found_res = client.get(f"/api/v1/goals/{goal_id}")
    assert not_found_res.status_code == 404
