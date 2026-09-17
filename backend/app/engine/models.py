"""
SaveSmart Financial Engine — Domain Models & Dataclasses
Pure Python domain models representing all entities and math payloads in INR (₹).
Zero external framework dependencies.
"""
from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional


class ShockType(str, Enum):
    INCOME_DROP = "income_drop"
    LUMP_SUM_EXPENSE = "lump_sum_expense"
    INFLATION_SPIKE = "inflation_spike"
    INTEREST_RATE_HIKE = "interest_rate_hike"


class ResilienceGrade(str, Enum):
    ROBUST = "ROBUST"
    MODERATE = "MODERATE"
    VULNERABLE = "VULNERABLE"
    CRITICAL = "CRITICAL"


class GoalPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


@dataclass(frozen=True)
class DebtCommitment:
    name: str
    monthly_payment: float  # In INR (₹)
    remaining_balance: float  # In INR (₹)
    interest_rate_annual: float  # e.g. 0.085 for 8.5%
    is_variable_rate: bool = False


@dataclass(frozen=True)
class FixedExpenses:
    rent_or_mortgage: float = 0.0  # In INR (₹)
    utilities: float = 0.0  # In INR (₹)
    insurance: float = 0.0  # In INR (₹)
    subscriptions_and_bills: float = 0.0  # In INR (₹)
    custom_fixed: Dict[str, float] = field(default_factory=dict)

    @property
    def total(self) -> float:
        return (
            self.rent_or_mortgage
            + self.utilities
            + self.insurance
            + self.subscriptions_and_bills
            + sum(self.custom_fixed.values())
        )


@dataclass(frozen=True)
class DiscretionaryExpenses:
    dining_out: float = 0.0  # In INR (₹)
    entertainment: float = 0.0  # In INR (₹)
    shopping: float = 0.0  # In INR (₹)
    other: float = 0.0  # In INR (₹)
    custom_discretionary: Dict[str, float] = field(default_factory=dict)

    @property
    def total(self) -> float:
        return (
            self.dining_out
            + self.entertainment
            + self.shopping
            + self.other
            + sum(self.custom_discretionary.values())
        )


@dataclass(frozen=True)
class BaselineProfile:
    user_id: str
    monthly_net_income: float  # In INR (₹)
    fixed_expenses: FixedExpenses
    discretionary_expenses: DiscretionaryExpenses
    debt_commitments: List[DebtCommitment] = field(default_factory=list)
    emergency_fund_balance: float = 0.0  # In INR (₹)

    @property
    def total_debt_payment(self) -> float:
        return sum(d.monthly_payment for d in self.debt_commitments)

    @property
    def net_free_cash_flow(self) -> float:
        """FCF = I_net - (E_fixed + E_discretionary + D_commitments)"""
        return (
            self.monthly_net_income
            - self.fixed_expenses.total
            - self.discretionary_expenses.total
            - self.total_debt_payment
        )

    @property
    def savings_capacity_percent(self) -> float:
        if self.monthly_net_income <= 0:
            return 0.0
        return (self.net_free_cash_flow / self.monthly_net_income) * 100.0


@dataclass(frozen=True)
class GoalSpec:
    goal_id: str
    name: str
    target_amount: float  # In INR (₹)
    current_balance: float  # In INR (₹)
    target_months: int  # e.g. 24 months
    priority: GoalPriority = GoalPriority.HIGH
    category: str = "general"

    @property
    def remaining_amount(self) -> float:
        return max(0.0, self.target_amount - self.current_balance)

    @property
    def required_monthly_contribution(self) -> float:
        if self.target_months <= 0:
            return self.remaining_amount
        return self.remaining_amount / self.target_months


@dataclass(frozen=True)
class ShockEvent:
    shock_type: ShockType
    start_month: int  # 1-indexed month when shock begins
    duration_months: int = 1  # Duration in months
    magnitude_percent: float = 0.0  # Fraction, e.g. 0.35 for 35%
    amount: float = 0.0  # Lump sum in INR (₹)
    description: str = ""


@dataclass
class MonthlySnapshot:
    month: int
    income: float  # In INR (₹)
    fixed_expenses: float  # In INR (₹)
    discretionary_expenses: float  # In INR (₹)
    debt_payments: float  # In INR (₹)
    extra_expenses: float  # In INR (₹)
    free_cash_flow: float  # In INR (₹)
    goal_contribution: float  # In INR (₹)
    goal_balance: float  # In INR (₹)
    emergency_buffer_balance: float  # In INR (₹)
    is_shock_active: bool
    is_insolvent: bool
    deficit_amount: float = 0.0  # In INR (₹)


@dataclass
class HealthRiskFactor:
    factor: str
    severity: str  # "LOW", "MEDIUM", "HIGH"
    description: str


@dataclass
class GoalHealthReport:
    goal_id: str
    currency: str
    health_status: str  # "HEALTHY", "MODERATE_RISK", "AT_RISK"
    baseline_resilience_score: float
    monthly_savings_rate: float
    free_cash_flow_margin: float
    emergency_buffer_months: float
    debt_to_income_ratio: float
    risk_factors: List[HealthRiskFactor] = field(default_factory=list)


@dataclass
class SimulationTimelineSummary:
    completion_month: Optional[int]
    final_balance: float


@dataclass
class StressedSimulationSummary:
    completion_month: Optional[int]
    slippage_months: int
    final_balance_at_original_deadline: float
    capital_deficit: float
    minimum_cash_buffer: float
    buffer_exhausted: bool = False
    insolvency_triggered: bool = False
    insolvency_first_month: Optional[int] = None
    peak_deficit: float = 0.0


@dataclass
class SimulationResult:
    simulation_id: str
    goal_id: str
    currency: str
    resilience_score: float
    resilience_grade: ResilienceGrade
    baseline: SimulationTimelineSummary
    stressed: StressedSimulationSummary
    monthly_timeline: List[MonthlySnapshot]
    shocks_applied: List[ShockEvent] = field(default_factory=list)


@dataclass
class RecoveryPlan:
    plan_id: str  # "aggressive", "balanced", "extended"
    name: str
    target_completion_month: int
    slippage_months: int
    discretionary_cut_percent: float
    discretionary_savings_monthly: float  # In INR (₹)
    monthly_contribution_adjusted: float  # In INR (₹)
    emergency_buffer_replenished_month: int
    feasibility_score: float
    description: str


@dataclass
class SurvivalMapData:
    goal_id: str
    currency: str
    total_months: int
    insolvency_threshold: float  # 0.00
    safe_buffer_threshold: float  # Baseline emergency buffer
    curves: Dict[str, List[float]]  # "baseline", "stressed", "recovered_balanced"
