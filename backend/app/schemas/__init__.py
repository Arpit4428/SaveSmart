"""
SaveSmart API Schemas Module
"""
from .common import ApiErrorDetail, ApiResponse, SystemHealthResponse
from .goal import (
    GoalCreateRequest,
    GoalHealthResponse,
    GoalHealthRiskFactorSchema,
    GoalResponse,
    GoalUpdateRequest,
)
from .baseline import (
    BaselineProfileRequest,
    BaselineProfileResponse,
    BaselineSummarySchema,
    DebtCommitmentSchema,
    DiscretionaryExpensesSchema,
    FixedExpensesSchema,
)

__all__ = [
    "ApiErrorDetail",
    "ApiResponse",
    "SystemHealthResponse",
    "GoalCreateRequest",
    "GoalHealthResponse",
    "GoalHealthRiskFactorSchema",
    "GoalResponse",
    "GoalUpdateRequest",
    "BaselineProfileRequest",
    "BaselineProfileResponse",
    "BaselineSummarySchema",
    "DebtCommitmentSchema",
    "DiscretionaryExpensesSchema",
    "FixedExpensesSchema",
]
