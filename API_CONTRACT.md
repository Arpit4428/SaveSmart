# SaveSmart — REST API Contract Specification

> **Base URL:** `http://localhost:8000/api/v1`  
> **Format:** JSON (`Content-Type: application/json`)  
> **Specification Standard:** OpenAPI 3.1 compatible  

---

## 1. Global Error Schema

All `4xx` and `5xx` responses adhere to this standard structure:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR | RESOURCE_NOT_FOUND | ENGINE_ERROR | AI_SERVICE_ERROR",
    "message": "Human-readable description of error",
    "details": {}
  }
}
```

---

## 2. System Health

### `GET /health`
Verifies backend status and external connections.

**Response `200 OK`:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "mongodb_connected": true,
  "gemini_api_configured": true
}
```

---

## 3. Goals API (`/goals`)

### `GET /goals`
Returns all active savings goals for the current user.

**Query Parameters:**
- `user_id` (string, optional, default: `"demo_user"`)

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "goal_65f1a",
      "user_id": "demo_user",
      "name": "Emergency Cushion & House Down Payment",
      "category": "housing",
      "target_amount": 25000.00,
      "current_balance": 4500.00,
      "target_months": 24,
      "priority": "high",
      "monthly_contribution": 854.17,
      "created_at": "2026-09-18T00:00:00Z"
    }
  ]
}
```

### `POST /goals`
Creates a new savings goal.

**Request Body:**
```json
{
  "user_id": "demo_user",
  "name": "Emergency Cushion & House Down Payment",
  "category": "housing",
  "target_amount": 25000.00,
  "current_balance": 4500.00,
  "target_months": 24,
  "priority": "high"
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "id": "goal_65f1a",
    "user_id": "demo_user",
    "name": "Emergency Cushion & House Down Payment",
    "category": "housing",
    "target_amount": 25000.00,
    "current_balance": 4500.00,
    "target_months": 24,
    "priority": "high",
    "monthly_contribution": 854.17,
    "created_at": "2026-09-18T00:00:00Z"
  }
}
```

---

## 4. Financial Baseline API (`/baseline`)

### `GET /baseline`
Fetches the user's financial profile.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "user_id": "demo_user",
    "monthly_net_income": 5000.00,
    "fixed_expenses": {
      "rent_or_mortgage": 1800.00,
      "utilities": 250.00,
      "insurance": 150.00,
      "subscriptions_and_bills": 100.00
    },
    "discretionary_expenses": {
      "dining_out": 400.00,
      "entertainment": 200.00,
      "shopping": 300.00,
      "other": 100.00
    },
    "debt_commitments": [
      {
        "name": "Auto Loan",
        "monthly_payment": 350.00,
        "remaining_balance": 8400.00,
        "interest_rate_annual": 0.055
      }
    ],
    "emergency_fund_balance": 3000.00,
    "summary": {
      "total_fixed_expenses": 2300.00,
      "total_discretionary_expenses": 1000.00,
      "total_debt_payments": 350.00,
      "net_free_cash_flow": 1350.00,
      "savings_capacity_percent": 27.0
    }
  }
}
```

### `POST /baseline`
Updates or creates the financial profile.

**Request Body:** Same schema as `data` object above (without computed `summary`).

---

## 5. Stress-Test Lab API (`/stress-test`)

### `POST /stress-test/simulate`
Simulates a single or customized financial shock against a goal.

**Request Body:**
```json
{
  "goal_id": "goal_65f1a",
  "shock": {
    "shock_type": "income_drop",
    "start_month": 3,
    "duration_months": 4,
    "magnitude_percent": 0.35,
    "description": "Furlough / Reduced Hours"
  }
}
```

*Supported Shock Types:*
- `income_drop`: Reduces net income by `magnitude_percent` for `duration_months`.
- `lump_sum_expense`: Immediate one-time cost of `amount` at `start_month`.
- `inflation_spike`: Increases fixed & discretionary expenses by `magnitude_percent` for `duration_months`.
- `interest_rate_hike`: Escalates variable debt payments by `interest_bump_percent`.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "simulation_id": "sim_8819",
    "goal_id": "goal_65f1a",
    "resilience_score": 58.4,
    "resilience_grade": "MODERATE",
    "baseline": {
      "completion_month": 24,
      "final_balance": 25000.00
    },
    "stressed": {
      "completion_month": 29,
      "slippage_months": 5,
      "final_balance_at_original_deadline": 19450.00,
      "capital_deficit": 5550.00,
      "minimum_cash_buffer": 800.00,
      "buffer_exhausted": false
    },
    "monthly_timeline": [
      {
        "month": 1,
        "baseline_balance": 5850.00,
        "stressed_balance": 5850.00,
        "stressed_cash_flow": 1350.00,
        "is_shock_active": false
      },
      {
        "month": 3,
        "baseline_balance": 8550.00,
        "stressed_balance": 7200.00,
        "stressed_cash_flow": -400.00,
        "is_shock_active": true
      }
    ]
  }
}
```

---

## 6. Cascade Mode API (`/stress-test/cascade`)

### `POST /stress-test/cascade`
Simulates compound, sequential shocks to test systemic failure points.

**Request Body:**
```json
{
  "goal_id": "goal_65f1a",
  "sequence_name": "Recession + Medical Crisis",
  "shocks": [
    {
      "shock_type": "income_drop",
      "start_month": 2,
      "duration_months": 3,
      "magnitude_percent": 0.40,
      "description": "Layoff with severance gap"
    },
    {
      "shock_type": "lump_sum_expense",
      "start_month": 4,
      "amount": 3200.00,
      "description": "Emergency surgery co-pay"
    }
  ]
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "simulation_id": "casc_9921",
    "resilience_score": 32.1,
    "resilience_grade": "CRITICAL",
    "cascade_triggered_insolvency": true,
    "insolvency_first_month": 4,
    "peak_deficit": -2350.00,
    "baseline_completion_month": 24,
    "stressed_completion_month": 37,
    "slippage_months": 13,
    "capital_deficit": 11200.00,
    "monthly_timeline": []
  }
}
```

---

## 7. Goal Health API (`/goals/{id}/health`)

### `GET /goals/{id}/health`
Evaluates the baseline health and risk profile of a goal before any shock.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "goal_id": "goal_65f1a",
    "health_status": "HEALTHY",
    "baseline_resilience_score": 84.0,
    "monthly_savings_rate": 854.17,
    "free_cash_flow_margin": 495.83,
    "emergency_buffer_months": 1.3,
    "debt_to_income_ratio": 0.07,
    "risk_factors": [
      {
        "factor": "emergency_buffer",
        "severity": "MEDIUM",
        "description": "Emergency cushion covers 1.3 months of fixed costs (recommended: 3+ months)."
      }
    ]
  }
}
```

---

## 8. Adaptive Recovery Planner API (`/recovery/plans`)

### `POST /recovery/plans`
Computes 3 deterministic mathematical recovery paths to absorb shock impact.

**Request Body:**
```json
{
  "simulation_id": "casc_9921"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "simulation_id": "casc_9921",
    "plans": [
      {
        "plan_id": "aggressive",
        "name": "Aggressive Expense Cut",
        "target_completion_month": 25,
        "slippage_months": 1,
        "discretionary_cut_percent": 0.60,
        "discretionary_savings_monthly": 600.00,
        "monthly_contribution_adjusted": 1150.00,
        "emergency_buffer_replenished_month": 8,
        "feasibility_score": 68.0,
        "description": "Cuts dining and entertainment by 60% immediately to preserve original target date."
      },
      {
        "plan_id": "balanced",
        "name": "Balanced Compromise",
        "target_completion_month": 28,
        "slippage_months": 4,
        "discretionary_cut_percent": 0.25,
        "discretionary_savings_monthly": 250.00,
        "monthly_contribution_adjusted": 920.00,
        "emergency_buffer_replenished_month": 12,
        "feasibility_score": 92.0,
        "description": "Mild 25% budget cut paired with a modest 4-month timeline extension."
      },
      {
        "plan_id": "extended",
        "name": "Extended Timeline (Zero Lifestyle Change)",
        "target_completion_month": 37,
        "slippage_months": 13,
        "discretionary_cut_percent": 0.0,
        "discretionary_savings_monthly": 0.00,
        "monthly_contribution_adjusted": 854.17,
        "emergency_buffer_replenished_month": 18,
        "feasibility_score": 98.0,
        "description": "Preserves all existing lifestyle habits while extending the finish line by 13 months."
      }
    ]
  }
}
```

---

## 9. Goal Survival Map API (`/survival/map`)

### `POST /survival/map`
Generates a multi-scenario matrix of monthly survival and liquidity points.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "goal_id": "goal_65f1a",
    "months": 36,
    "insolvency_threshold": 0.00,
    "safe_buffer_threshold": 3000.00,
    "curves": {
      "baseline": [4500, 5850, 7200, 8550, 9900],
      "stressed": [4500, 5850, 5450, 5050, 4650],
      "recovered_balanced": [4500, 5850, 5700, 5550, 6470]
    }
  }
}
```

---

## 10. Gemini Explainer API (`/explain`)

### `POST /explain/scenario`
Generates an empathetic AI narrative strictly explaining verified engine results.

**Request Body:**
```json
{
  "simulation_id": "casc_9921",
  "engine_output": {
    "goal_name": "Emergency Cushion & House Down Payment",
    "target_amount": 25000.00,
    "resilience_score": 32.1,
    "resilience_grade": "CRITICAL",
    "slippage_months": 13,
    "capital_deficit": 11200.00,
    "minimum_liquidity": -2350.00,
    "insolvency_month": 4,
    "shocks_applied": [
      "40% income reduction for 3 months starting Month 2",
      "$3,200 medical emergency in Month 4"
    ]
  }
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "simulation_id": "casc_9921",
    "executive_summary": "Your goal faces a Critical Resilience warning (Score 32.1/100). The combination of a 40% income drop and a $3,200 medical shock depletes your cash reserves by Month 4, leaving a peak deficit of -$2,350.",
    "key_findings": [
      "Target completion slips by 13 months (from Month 24 to Month 37).",
      "Total capital shortfall reaches $11,200 at your initial target date.",
      "Insolvency triggers in Month 4 when medical bills overlap with reduced earnings."
    ],
    "actionable_coaching": "Your immediate priority is avoiding Month 4 negative cash flow. Review the Balanced Recovery Plan to trim $250/mo in discretionary spending, or pause goal contributions during months 2-4 to preserve core liquidity."
  }
}
```
