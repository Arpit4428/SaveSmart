"""
SaveSmart Baseline Service
Bridges API requests and repository data to the deterministic Financial Engine.
Zero financial calculations performed here: all math delegates strictly to backend/app/engine/.
"""
from typing import Optional
from app.db.repositories.baseline_repository import baseline_repository
from app.engine.cashflow import compute_free_cash_flow
from app.engine.models import (
    BaselineProfile as EngineBaselineProfile,
    DebtCommitment as EngineDebtCommitment,
    DiscretionaryExpenses as EngineDiscretionaryExpenses,
    FixedExpenses as EngineFixedExpenses,
)
from app.schemas.baseline import (
    BaselineProfileRequest,
    BaselineProfileResponse,
    BaselineSummarySchema,
    DebtCommitmentSchema,
    DiscretionaryExpensesSchema,
    FixedExpensesSchema,
)


def map_dict_to_engine_baseline(data: dict) -> EngineBaselineProfile:
    """Converts a baseline dictionary into the deterministic Financial Engine BaselineProfile."""
    fixed_dict = data.get("fixed_expenses", {})
    fixed_engine = EngineFixedExpenses(
        rent_or_mortgage=float(fixed_dict.get("rent_or_mortgage", 0.0)),
        utilities=float(fixed_dict.get("utilities", 0.0)),
        insurance=float(fixed_dict.get("insurance", 0.0)),
        subscriptions_and_bills=float(fixed_dict.get("subscriptions_and_bills", 0.0)),
        custom_fixed=fixed_dict.get("custom_fixed", {})
    )

    disc_dict = data.get("discretionary_expenses", {})
    disc_engine = EngineDiscretionaryExpenses(
        dining_out=float(disc_dict.get("dining_out", 0.0)),
        entertainment=float(disc_dict.get("entertainment", 0.0)),
        shopping=float(disc_dict.get("shopping", 0.0)),
        other=float(disc_dict.get("other", 0.0)),
        custom_discretionary=disc_dict.get("custom_discretionary", {})
    )

    debt_list = data.get("debt_commitments", [])
    debt_engine = [
        EngineDebtCommitment(
            name=d.get("name", ""),
            monthly_payment=float(d.get("monthly_payment", 0.0)),
            remaining_balance=float(d.get("remaining_balance", 0.0)),
            interest_rate_annual=float(d.get("interest_rate_annual", 0.0)),
            is_variable_rate=bool(d.get("is_variable_rate", False))
        )
        for d in debt_list
    ]

    return EngineBaselineProfile(
        user_id=data.get("user_id", "demo_user"),
        monthly_net_income=float(data.get("monthly_net_income", 0.0)),
        fixed_expenses=fixed_engine,
        discretionary_expenses=disc_engine,
        debt_commitments=debt_engine,
        emergency_fund_balance=float(data.get("emergency_fund_balance", 0.0))
    )


class BaselineService:
    """Orchestrates Baseline profile workflows with the deterministic Financial Engine."""

    async def get_user_baseline(self, user_id: str) -> Optional[BaselineProfileResponse]:
        doc = await baseline_repository.get_baseline_by_user(user_id)
        if not doc:
            return None

        # Convert to Engine model to calculate deterministic summaries
        engine_profile = map_dict_to_engine_baseline(doc)
        net_fcf = compute_free_cash_flow(engine_profile)

        summary = BaselineSummarySchema(
            total_fixed_expenses=round(engine_profile.fixed_expenses.total, 2),
            total_discretionary_expenses=round(engine_profile.discretionary_expenses.total, 2),
            total_debt_payments=round(engine_profile.total_debt_payment, 2),
            net_free_cash_flow=net_fcf,
            savings_capacity_percent=round(engine_profile.savings_capacity_percent, 1)
        )

        return BaselineProfileResponse(
            user_id=user_id,
            monthly_net_income=engine_profile.monthly_net_income,
            fixed_expenses=FixedExpensesSchema(**doc.get("fixed_expenses", {})),
            discretionary_expenses=DiscretionaryExpensesSchema(**doc.get("discretionary_expenses", {})),
            debt_commitments=[DebtCommitmentSchema(**d) for d in doc.get("debt_commitments", [])],
            emergency_fund_balance=engine_profile.emergency_fund_balance,
            summary=summary
        )

    async def save_user_baseline(self, req: BaselineProfileRequest) -> BaselineProfileResponse:
        data_dict = req.model_dump()
        await baseline_repository.save_baseline(req.user_id, data_dict)

        # Delegate calculations to Financial Engine
        engine_profile = map_dict_to_engine_baseline(data_dict)
        net_fcf = compute_free_cash_flow(engine_profile)

        summary = BaselineSummarySchema(
            total_fixed_expenses=round(engine_profile.fixed_expenses.total, 2),
            total_discretionary_expenses=round(engine_profile.discretionary_expenses.total, 2),
            total_debt_payments=round(engine_profile.total_debt_payment, 2),
            net_free_cash_flow=net_fcf,
            savings_capacity_percent=round(engine_profile.savings_capacity_percent, 1)
        )

        return BaselineProfileResponse(
            user_id=req.user_id,
            monthly_net_income=engine_profile.monthly_net_income,
            fixed_expenses=req.fixed_expenses,
            discretionary_expenses=req.discretionary_expenses,
            debt_commitments=req.debt_commitments,
            emergency_fund_balance=req.emergency_fund_balance,
            summary=summary
        )


baseline_service = BaselineService()
