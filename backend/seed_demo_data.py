"""
SaveSmart Demo Data Seeder
Populates realistic Indian personal financial resilience scenarios for hackathon demos.
Currency: Indian Rupee (INR / ₹)
"""
import asyncio
import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.mongodb import connect_to_mongo, close_mongo_connection, get_database
from app.db.repositories.goal_repository import goal_repository
from app.db.repositories.baseline_repository import baseline_repository


DEMO_SCENARIOS = [
    {
        "key": "homebuyer",
        "name": "First-Time Homebuyer (Bangalore Tech Couple)",
        "goal": {
            "user_id": "demo_user",
            "name": "Dream Home Down Payment",
            "category": "housing",
            "target_amount": 2500000.0,
            "current_balance": 400000.0,
            "target_months": 24,
            "priority": "high",
        },
        "baseline": {
            "user_id": "demo_user",
            "monthly_net_income": 150000.0,
            "fixed_expenses": {
                "rent_or_mortgage": 40000.0,
                "utilities": 6000.0,
                "insurance": 4000.0,
                "subscriptions_and_bills": 3000.0,
            },
            "discretionary_expenses": {
                "dining_out": 10000.0,
                "entertainment": 5000.0,
                "shopping": 8000.0,
                "other": 3000.0,
            },
            "debt_commitments": [
                {
                    "name": "Auto Loan EMI",
                    "monthly_payment": 12500.0,
                    "remaining_balance": 380000.0,
                    "interest_rate_annual": 0.085,
                    "is_variable_rate": True,
                }
            ],
            "emergency_fund_balance": 400000.0,
        },
    },
    {
        "key": "wedding",
        "name": "Wedding Celebration Fund (Mumbai Designer)",
        "goal": {
            "user_id": "demo_user_wedding",
            "name": "Wedding Celebration Fund",
            "category": "lifestyle",
            "target_amount": 1500000.0,
            "current_balance": 250000.0,
            "target_months": 18,
            "priority": "high",
        },
        "baseline": {
            "user_id": "demo_user_wedding",
            "monthly_net_income": 110000.0,
            "fixed_expenses": {
                "rent_or_mortgage": 32000.0,
                "utilities": 5000.0,
                "insurance": 3000.0,
                "subscriptions_and_bills": 2000.0,
            },
            "discretionary_expenses": {
                "dining_out": 12000.0,
                "entertainment": 4000.0,
                "shopping": 8000.0,
                "other": 2000.0,
            },
            "debt_commitments": [],
            "emergency_fund_balance": 250000.0,
        },
    },
    {
        "key": "startup",
        "name": "Founder Personal Runway (Delhi Startup)",
        "goal": {
            "user_id": "demo_user_startup",
            "name": "Founder Personal Runway",
            "category": "emergency",
            "target_amount": 1000000.0,
            "current_balance": 200000.0,
            "target_months": 12,
            "priority": "high",
        },
        "baseline": {
            "user_id": "demo_user_startup",
            "monthly_net_income": 180000.0,
            "fixed_expenses": {
                "rent_or_mortgage": 45000.0,
                "utilities": 8000.0,
                "insurance": 5000.0,
                "subscriptions_and_bills": 4000.0,
            },
            "discretionary_expenses": {
                "dining_out": 15000.0,
                "entertainment": 5000.0,
                "shopping": 10000.0,
                "other": 5000.0,
            },
            "debt_commitments": [
                {
                    "name": "Education Loan",
                    "monthly_payment": 15000.0,
                    "remaining_balance": 450000.0,
                    "interest_rate_annual": 0.09,
                    "is_variable_rate": False,
                }
            ],
            "emergency_fund_balance": 500000.0,
        },
    },
]


async def seed_data():
    sys.stdout.reconfigure(encoding="utf-8")
    print("[INIT] Initializing SaveSmart Demo Data Seeder...")
    await connect_to_mongo()

    # Clear previous demo records to prevent duplicate list inflation
    db = get_database()
    if db is not None:
        print("[CLEAN] Cleaning previous demo records...")
        await db.goals.delete_many({"user_id": {"$in": ["demo_user", "demo_user_wedding", "demo_user_startup"]}})
        await db.baselines.delete_many({"user_id": {"$in": ["demo_user", "demo_user_wedding", "demo_user_startup"]}})

    for scenario in DEMO_SCENARIOS:
        print(f"\n[SEED] Seeding Scenario: {scenario['name']}...")
        saved_baseline = await baseline_repository.save_baseline(scenario["baseline"]["user_id"], scenario["baseline"])
        print(f"   Baseline created for {scenario['baseline']['user_id']} (Income: ₹{scenario['baseline']['monthly_net_income']:,.2f})")

        saved_goal = await goal_repository.create_goal(scenario["goal"])
        print(f"   Goal created: '{saved_goal['name']}' (Target: ₹{saved_goal['target_amount']:,.2f}, ID: {saved_goal['id']})")

    await close_mongo_connection()
    print("\n[SUCCESS] Demo Data Seeding Completed Successfully! All records saved in INR (₹).")


if __name__ == "__main__":
    asyncio.run(seed_data())
