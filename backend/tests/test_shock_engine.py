"""
Unit Tests for SaveSmart Shock Engine
Verifies single-shock mechanics: income reduction, lump sum expense, inflation spike, and interest hike.
"""
from app.engine.models import DebtCommitment, ShockEvent, ShockType
from app.engine.shocks import (
    compute_monthly_debt_payments_under_shocks,
    compute_monthly_expenses_under_shocks,
    compute_monthly_income_under_shocks,
)


def test_income_drop_shock():
    base_income = 120000.0
    shocks = [
        ShockEvent(
            shock_type=ShockType.INCOME_DROP,
            start_month=3,
            duration_months=3,
            magnitude_percent=0.40  # 40% reduction
        )
    ]

    # Month 1 & 2: Unaffected
    inc_1, active_1 = compute_monthly_income_under_shocks(base_income, 1, shocks)
    assert inc_1 == 120000.0
    assert active_1 is False

    inc_2, active_2 = compute_monthly_income_under_shocks(base_income, 2, shocks)
    assert inc_2 == 120000.0
    assert active_2 is False

    # Month 3, 4, 5: 40% drop -> 72,000
    for m in [3, 4, 5]:
        inc_m, active_m = compute_monthly_income_under_shocks(base_income, m, shocks)
        assert inc_m == 72000.0
        assert active_m is True

    # Month 6: Normalcy restored
    inc_6, active_6 = compute_monthly_income_under_shocks(base_income, 6, shocks)
    assert inc_6 == 120000.0
    assert active_6 is False


def test_lump_sum_expense_shock():
    base_fixed = 48000.0
    base_disc = 26000.0
    shocks = [
        ShockEvent(
            shock_type=ShockType.LUMP_SUM_EXPENSE,
            start_month=4,
            amount=150000.0,
            description="Medical Hospitalization Co-Pay"
        )
    ]

    # Month 3: No extra expense
    fixed, disc, extra, active = compute_monthly_expenses_under_shocks(base_fixed, base_disc, 3, shocks)
    assert extra == 0.0
    assert active is False

    # Month 4: Extra 150,000
    fixed, disc, extra, active = compute_monthly_expenses_under_shocks(base_fixed, base_disc, 4, shocks)
    assert extra == 150000.0
    assert fixed == 48000.0
    assert disc == 26000.0
    assert active is True

    # Month 5: Back to 0 extra
    fixed, disc, extra, active = compute_monthly_expenses_under_shocks(base_fixed, base_disc, 5, shocks)
    assert extra == 0.0
    assert active is False


def test_inflation_spike_shock():
    base_fixed = 48000.0
    base_disc = 26000.0
    shocks = [
        ShockEvent(
            shock_type=ShockType.INFLATION_SPIKE,
            start_month=2,
            duration_months=6,
            magnitude_percent=0.12  # 12% annualized -> 1% monthly compound
        )
    ]

    # Month 1: Unaffected
    fixed_1, disc_1, extra_1, active_1 = compute_monthly_expenses_under_shocks(base_fixed, base_disc, 1, shocks)
    assert fixed_1 == 48000.0
    assert active_1 is False

    # Month 2: First month of inflation: compound factor (1 + 0.12/12)^1 = 1.01
    fixed_2, disc_2, extra_2, active_2 = compute_monthly_expenses_under_shocks(base_fixed, base_disc, 2, shocks)
    assert fixed_2 == round(48000.0 * 1.01, 2)
    assert disc_2 == round(26000.0 * 1.01, 2)
    assert active_2 is True


def test_interest_rate_hike_shock():
    debts = [
        DebtCommitment(
            name="Car Loan",
            monthly_payment=12500.0,
            remaining_balance=380000.0,
            interest_rate_annual=0.085,
            is_variable_rate=True
        )
    ]
    # 250 bps rate hike (+2.5% = 0.025)
    shocks = [
        ShockEvent(
            shock_type=ShockType.INTEREST_RATE_HIKE,
            start_month=3,
            duration_months=12,
            magnitude_percent=0.025
        )
    ]

    # Month 2: Base payment 12,500
    payment_2, active_2 = compute_monthly_debt_payments_under_shocks(debts, 2, shocks)
    assert payment_2 == 12500.0
    assert active_2 is False

    # Month 3: Additional monthly interest: 380,000 * (0.025 / 12) = 791.67 -> Total 13,291.67
    payment_3, active_3 = compute_monthly_debt_payments_under_shocks(debts, 3, shocks)
    expected = round(12500.0 + (380000.0 * 0.025 / 12.0), 2)
    assert payment_3 == expected
    assert active_3 is True
