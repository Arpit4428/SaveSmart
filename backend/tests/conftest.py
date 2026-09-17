"""
Pytest Fixtures for SaveSmart Financial Engine Tests
Standardized Indian Rupee (INR / ₹) profiles and goal scenarios.
"""
import pytest
from app.engine.models import (
    BaselineProfile,
    DebtCommitment,
    DiscretionaryExpenses,
    FixedExpenses,
    GoalPriority,
    GoalSpec,
)


@pytest.fixture
def standard_fixed_expenses() -> FixedExpenses:
    return FixedExpenses(
        rent_or_mortgage=35000.0,
        utilities=6000.0,
        insurance=4000.0,
        subscriptions_and_bills=3000.0
    )


@pytest.fixture
def standard_discretionary_expenses() -> DiscretionaryExpenses:
    return DiscretionaryExpenses(
        dining_out=10000.0,
        entertainment=5000.0,
        shopping=8000.0,
        other=3000.0
    )


@pytest.fixture
def standard_debts() -> list:
    return [
        DebtCommitment(
            name="Car Loan",
            monthly_payment=12500.0,
            remaining_balance=380000.0,
            interest_rate_annual=0.085,
            is_variable_rate=True
        )
    ]


@pytest.fixture
def standard_baseline(
    standard_fixed_expenses,
    standard_discretionary_expenses,
    standard_debts
) -> BaselineProfile:
    """
    Standard profile:
    Net Income: ₹1,20,000
    Fixed Expenses: ₹48,000
    Discretionary: ₹26,000
    Debt: ₹12,500
    Total Expenses: ₹86,500
    Net Free Cash Flow: ₹33,500
    Emergency Buffer: ₹1,50,000 (covers 3.125 months of fixed expenses)
    """
    return BaselineProfile(
        user_id="user_test_01",
        monthly_net_income=120000.0,
        fixed_expenses=standard_fixed_expenses,
        discretionary_expenses=standard_discretionary_expenses,
        debt_commitments=standard_debts,
        emergency_fund_balance=150000.0
    )


@pytest.fixture
def standard_goal() -> GoalSpec:
    """
    Standard Goal:
    Target: ₹5,00,000
    Current: ₹1,00,000
    Remaining: ₹4,00,000
    Horizon: 20 months
    Required Monthly Contribution: ₹20,000 (well within ₹33,500 FCF)
    """
    return GoalSpec(
        goal_id="goal_test_01",
        name="House Down Payment Cushion",
        target_amount=500000.0,
        current_balance=100000.0,
        target_months=20,
        priority=GoalPriority.HIGH,
        category="housing"
    )
