"""
Phase 1B Live Integration Verification Script
Tests FastAPI app + MongoDB Atlas connectivity, CRUD operations, and live database persistence.
Never logs or prints any credentials.
"""
import asyncio
import logging
import sys

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Suppress verbose pymongo command debug logs
logging.getLogger("pymongo").setLevel(logging.WARNING)
logging.getLogger("motor").setLevel(logging.WARNING)

from fastapi.testclient import TestClient
from bson import ObjectId
from app.core.config import settings
from app.db.mongodb import connect_to_mongo, close_mongo_connection, ping_database, get_database
from main import app


async def run_verification():
    print("=== SaveSmart Phase 1B Live Integration Verification ===")
    
    # 1. Test direct database connection
    print("Step 1: Connecting to MongoDB Atlas...")
    await connect_to_mongo()
    is_connected = await ping_database()
    print(f"MongoDB Ping Verification: {'SUCCESS (Connected)' if is_connected else 'FAILED'}")
    if not is_connected:
        print("ERROR: Could not establish ping to MongoDB Atlas.")
        await close_mongo_connection()
        sys.exit(1)
        
    db = get_database()
    if db is None:
        print("ERROR: Database instance is None.")
        await close_mongo_connection()
        sys.exit(1)

    print(f"Connected to Database: {settings.MONGODB_DB_NAME}")

    # 2. Test through FastAPI Client
    test_user = "live_verification_user_42"
    created_goal_id = None

    with TestClient(app) as client:
        # Step 2: Health check
        print("\nStep 2: Verifying GET /api/v1/health...")
        health_resp = client.get("/api/v1/health")
        assert health_resp.status_code == 200, f"Health check failed: {health_resp.text}"
        health_data = health_resp.json()
        print(f"Health Response: status={health_data['status']}, mongodb_connected={health_data['mongodb_connected']}, currency={health_data['currency']}")
        assert health_data["mongodb_connected"] is True, "mongodb_connected is False!"

        # Step 3: Create Goal through API
        print("\nStep 3: Creating Goal via POST /api/v1/goals...")
        goal_payload = {
            "user_id": test_user,
            "name": "Live Atlas Verification Down Payment",
            "category": "housing",
            "target_amount": 2500000.0,
            "current_balance": 500000.0,
            "target_months": 24,
            "priority": "high"
        }
        create_resp = client.post("/api/v1/goals", json=goal_payload)
        assert create_resp.status_code == 201, f"Create goal failed: {create_resp.text}"
        goal_res = create_resp.json()
        assert goal_res["success"] is True
        created_goal = goal_res["data"]
        created_goal_id = created_goal["id"]
        print(f"Goal created successfully with ID: {created_goal_id}")
        print(f"Required Monthly Contribution (Engine): INR {created_goal['monthly_contribution']:,.2f}")

        # Step 4: Retrieve Goal through API
        print(f"\nStep 4: Retrieving Goal via GET /api/v1/goals/{created_goal_id}...")
        get_resp = client.get(f"/api/v1/goals/{created_goal_id}")
        assert get_resp.status_code == 200, f"Get goal failed: {get_resp.text}"
        fetched_goal = get_resp.json()["data"]
        assert fetched_goal["id"] == created_goal_id
        assert fetched_goal["target_amount"] == 2500000.0
        print(f"Goal retrieved successfully: '{fetched_goal['name']}'")

        # Step 5: Save Financial Baseline through API
        print("\nStep 5: Saving Financial Baseline via POST /api/v1/baseline...")
        baseline_payload = {
            "user_id": test_user,
            "monthly_net_income": 125000.0,
            "fixed_expenses": {
                "rent_or_mortgage": 35000.0,
                "utilities": 7000.0,
                "insurance": 3000.0,
                "subscriptions_and_bills": 2000.0
            },
            "discretionary_expenses": {
                "dining_out": 12000.0,
                "entertainment": 6000.0,
                "shopping": 7000.0,
                "other": 3000.0
            },
            "debt_commitments": [
                {
                    "name": "Vehicle Loan",
                    "monthly_payment": 15000.0,
                    "remaining_balance": 450000.0,
                    "interest_rate_annual": 0.085,
                    "is_variable_rate": True
                }
            ],
            "emergency_fund_balance": 180000.0
        }
        baseline_resp = client.post("/api/v1/baseline", json=baseline_payload)
        assert baseline_resp.status_code == 200, f"Save baseline failed: {baseline_resp.text}"
        saved_baseline = baseline_resp.json()["data"]
        print(f"Baseline saved successfully. Net FCF: INR {saved_baseline['summary']['net_free_cash_flow']:,.2f}")

        # Step 6: Retrieve Financial Baseline through API
        print(f"\nStep 6: Retrieving Baseline via GET /api/v1/baseline?user_id={test_user}...")
        get_base_resp = client.get(f"/api/v1/baseline?user_id={test_user}")
        assert get_base_resp.status_code == 200, f"Get baseline failed: {get_base_resp.text}"
        fetched_base = get_base_resp.json()["data"]
        assert fetched_base["user_id"] == test_user
        assert fetched_base["monthly_net_income"] == 125000.0
        print(f"Baseline retrieved successfully: Income = INR {fetched_base['monthly_net_income']:,.2f}")

        # Step 7: Confirm direct persistence in MongoDB Atlas collection
        print("\nStep 7: Confirming direct persistence in MongoDB Atlas...")
        mongo_goal = await db["goals"].find_one({"_id": ObjectId(created_goal_id)})
        assert mongo_goal is not None, "Goal document NOT found in MongoDB Atlas 'goals' collection!"
        print(f"CONFIRMED in MongoDB Atlas: Goal '{mongo_goal['name']}' exists with target INR {mongo_goal['target_amount']:,.2f}")

        mongo_base = await db["baselines"].find_one({"user_id": test_user})
        assert mongo_base is not None, "Baseline document NOT found in MongoDB Atlas 'baselines' collection!"
        print(f"CONFIRMED in MongoDB Atlas: Baseline exists with user_id='{mongo_base['user_id']}', income=INR {mongo_base['monthly_net_income']:,.2f}")

        # Step 8: Clean up test records
        print("\nStep 8: Cleaning up verification test records from MongoDB Atlas...")
        del_goal_res = await db["goals"].delete_one({"_id": ObjectId(created_goal_id)})
        del_base_res = await db["baselines"].delete_one({"user_id": test_user})
        print(f"Cleanup completed: {del_goal_res.deleted_count} test goal deleted, {del_base_res.deleted_count} test baseline deleted.")

    await close_mongo_connection()
    print("\n=== ALL LIVE INTEGRATION VERIFICATIONS PASSED SUCCESSFULLY ===")


if __name__ == "__main__":
    asyncio.run(run_verification())
