"""
SaveSmart Baseline Financial Schemas
Pydantic schemas for Income, Fixed Expenses, Discretionary Spending, and Debt Commitments in INR (₹).
"""
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class DebtCommitmentSchema(BaseModel):
    name: str = Field(..., description="Debt name (e.g. Car Loan, Credit Card)")
    monthly_payment: float = Field(..., ge=0, description="Monthly payment amount in INR (₹)")
    remaining_balance: float = Field(..., ge=0, description="Total outstanding balance in INR (₹)")
    interest_rate_annual: float = Field(..., ge=0, le=1.0, description="Annual interest rate as decimal (e.g. 0.085)")
    is_variable_rate: bool = Field(default=False, description="Whether interest rate is floating/variable")


class FixedExpensesSchema(BaseModel):
    rent_or_mortgage: float = Field(default=0.0, ge=0)
    utilities: float = Field(default=0.0, ge=0)
    insurance: float = Field(default=0.0, ge=0)
    subscriptions_and_bills: float = Field(default=0.0, ge=0)
    custom_fixed: Dict[str, float] = Field(default_factory=dict)


class DiscretionaryExpensesSchema(BaseModel):
    dining_out: float = Field(default=0.0, ge=0)
    entertainment: float = Field(default=0.0, ge=0)
    shopping: float = Field(default=0.0, ge=0)
    other: float = Field(default=0.0, ge=0)
    custom_discretionary: Dict[str, float] = Field(default_factory=dict)


class BaselineSummarySchema(BaseModel):
    total_fixed_expenses: float
    total_discretionary_expenses: float
    total_debt_payments: float
    net_free_cash_flow: float
    savings_capacity_percent: float


class BaselineProfileRequest(BaseModel):
    user_id: str = Field(default="demo_user", description="User ID")
    monthly_net_income: float = Field(..., gt=0, description="Net take-home monthly income in INR (₹)")
    fixed_expenses: FixedExpensesSchema
    discretionary_expenses: DiscretionaryExpensesSchema
    debt_commitments: List[DebtCommitmentSchema] = Field(default_factory=list)
    emergency_fund_balance: float = Field(default=0.0, ge=0, description="Current emergency buffer in INR (₹)")


class BaselineProfileResponse(BaseModel):
    user_id: str
    monthly_net_income: float
    fixed_expenses: FixedExpensesSchema
    discretionary_expenses: DiscretionaryExpensesSchema
    debt_commitments: List[DebtCommitmentSchema]
    emergency_fund_balance: float
    summary: BaselineSummarySchema
