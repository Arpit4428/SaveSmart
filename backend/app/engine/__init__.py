"""
SaveSmart Deterministic Financial Engine
Pure Python financial calculation, shock simulation, health scoring, and recovery planner.
Zero external network, database, or LLM dependencies.
All values denominated in Indian Rupees (INR / ₹).
"""
from .models import (
    AssumptionLedger,
    BaselineProfile,
    ChainReactionStep,
    DebtCommitment,
    DiscretionaryExpenses,
    FailureDiagnostic,
    FixedExpenses,
    GoalHealthReport,
    GoalPriority,
    GoalSpec,
    HealthRiskFactor,
    MonthlySnapshot,
    RecoveryPlan,
    ResilienceFingerprint,
    ResilienceGrade,
    ShockEvent,
    ShockType,
    SimulationResult,
    SimulationTimelineSummary,
    StressedSimulationSummary,
    SurvivalMapData,
)
from .cashflow import (
    check_baseline_feasibility,
    compute_free_cash_flow,
    compute_required_monthly_contribution,
    find_completion_month,
    project_baseline_trajectory,
)
from .shocks import (
    compute_monthly_debt_payments_under_shocks,
    compute_monthly_expenses_under_shocks,
    compute_monthly_income_under_shocks,
)
from .cascade import (
    analyze_simulation_results,
    generate_chain_reaction_steps,
    simulate_cascade_progression,
)
from .health import (
    compute_resilience_fingerprint,
    compute_resilience_score,
    diagnose_goal_failure,
    evaluate_baseline_goal_health,
    get_resilience_grade,
)
from .recovery import generate_recovery_plans
from .survival import generate_survival_map

__all__ = [
    "BaselineProfile",
    "DebtCommitment",
    "DiscretionaryExpenses",
    "FixedExpenses",
    "GoalHealthReport",
    "GoalPriority",
    "GoalSpec",
    "HealthRiskFactor",
    "MonthlySnapshot",
    "RecoveryPlan",
    "ResilienceGrade",
    "ShockEvent",
    "ShockType",
    "SimulationResult",
    "SimulationTimelineSummary",
    "StressedSimulationSummary",
    "SurvivalMapData",
    "check_baseline_feasibility",
    "compute_free_cash_flow",
    "compute_required_monthly_contribution",
    "find_completion_month",
    "project_baseline_trajectory",
    "compute_monthly_debt_payments_under_shocks",
    "compute_monthly_expenses_under_shocks",
    "compute_monthly_income_under_shocks",
    "analyze_simulation_results",
    "simulate_cascade_progression",
    "compute_resilience_score",
    "evaluate_baseline_goal_health",
    "get_resilience_grade",
    "generate_recovery_plans",
    "generate_survival_map",
]
