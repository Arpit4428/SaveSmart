# SaveSmart — REST API Contract Specification

> **Base URL:** `http://localhost:8000/api/v1`  
> **Currency Standard:** Indian Rupee (INR / ₹)  
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
  "currency": "INR",
  "mongodb_connected": true,
  "gemini_api_configured": true
}
```

---

## 3. Goals API (`/goals`)

### `GET /goals`
Returns all active savings goals for the current user. All amounts in INR (₹).

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
      "name": "House Down Payment & Emergency Cushion",
      "category": "housing",
      "target_amount": 2500000.00,
      "current_balance": 450000.00,
      "target_months": 24,
      "priority": "high",
      "monthly_contribution": 85416.67,
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
  "name": "House Down Payment & Emergency Cushion",
  "category": "housing",
  "target_amount": 2500000.00,
  "current_balance": 450000.00,
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
    "name": "House Down Payment & Emergency Cushion",
    "category": "housing",
    "target_amount": 2500000.00,
    "current_balance": 450000.00,
    "target_months": 24,
    "priority": "high",
    "monthly_contribution": 85416.67,
    "created_at": "2026-09-18T00:00:00Z"
  }
}
```

---

## 4. Financial Baseline API (`/baseline`)

### `GET /baseline`
Fetches the user's financial profile. All values denominated in INR (₹).

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "user_id": "demo_user",
    "monthly_net_income": 120000.00,
    "fixed_expenses": {
      "rent_or_mortgage": 35000.00,
      "utilities": 6000.00,
      "insurance": 4000.00,
      "subscriptions_and_bills": 3000.00
    },
    "discretionary_expenses": {
      "dining_out": 10000.00,
      "entertainment": 5000.00,
      "shopping": 8000.00,
      "other": 3000.00
    },
    "debt_commitments": [
      {
        "name": "Auto Loan",
        "monthly_payment": 12500.00,
        "remaining_balance": 380000.00,
        "interest_rate_annual": 0.085
      }
    ],
    "emergency_fund_balance": 150000.00,
    "summary": {
      "total_fixed_expenses": 48000.00,
      "total_discretionary_expenses": 26000.00,
      "total_debt_payments": 12500.00,
      "net_free_cash_flow": 33500.00,
      "savings_capacity_percent": 27.9
    }
  }
}
```

### `POST /baseline`
Updates or creates the financial profile in INR (₹).

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
    "description": "Salary Reduction / Project Pause"
  }
}
```

*Supported Shock Types:*
- `income_drop`: Reduces net income by `magnitude_percent` for `duration_months`.
- `lump_sum_expense`: Immediate one-time cost of `amount` in ₹ at `start_month`.
- `inflation_spike`: Increases fixed & discretionary expenses by `magnitude_percent` for `duration_months`.
- `interest_rate_hike`: Escalates variable debt payments by `interest_bump_percent`.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "simulation_id": "sim_8819",
    "goal_id": "goal_65f1a",
    "currency": "INR",
    "resilience_score": 58.4,
    "resilience_grade": "MODERATE",
    "baseline": {
      "completion_month": 24,
      "final_balance": 2500000.00
    },
    "stressed": {
      "completion_month": 29,
      "slippage_months": 5,
      "final_balance_at_original_deadline": 2185000.00,
      "capital_deficit": 315000.00,
      "minimum_cash_buffer": 42000.00,
      "buffer_exhausted": false
    },
    "monthly_timeline": [
      {
        "month": 1,
        "baseline_balance": 535416.67,
        "stressed_balance": 535416.67,
        "stressed_cash_flow": 33500.00,
        "is_shock_active": false
      },
      {
        "month": 3,
        "baseline_balance": 706250.00,
        "stressed_balance": 612500.00,
        "stressed_cash_flow": -8500.00,
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
      "description": "Layoff with contract gap"
    },
    {
      "shock_type": "lump_sum_expense",
      "start_month": 4,
      "amount": 150000.00,
      "description": "Emergency hospitalization co-pay"
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
    "currency": "INR",
    "resilience_score": 32.1,
    "resilience_grade": "CRITICAL",
    "cascade_triggered_insolvency": true,
    "insolvency_first_month": 4,
    "peak_deficit": -65000.00,
    "baseline_completion_month": 24,
    "stressed_completion_month": 37,
    "slippage_months": 13,
    "capital_deficit": 640000.00,
    "monthly_timeline": []
  }
}
```

---

## 7. Goal Health API (`/goals/{id}/health`)

### `GET /goals/{id}/health`
Evaluates baseline health and risk profile before any shock.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "goal_id": "goal_65f1a",
    "currency": "INR",
    "health_status": "HEALTHY",
    "baseline_resilience_score": 84.0,
    "monthly_savings_rate": 85416.67,
    "free_cash_flow_margin": 33500.00,
    "emergency_buffer_months": 3.1,
    "debt_to_income_ratio": 0.104,
    "risk_factors": [
      {
        "factor": "emergency_buffer",
        "severity": "LOW",
        "description": "Emergency cushion covers 3.1 months of fixed living expenses."
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
    "currency": "INR",
    "plans": [
      {
        "plan_id": "aggressive",
        "name": "Aggressive Expense Cut",
        "target_completion_month": 26,
        "slippage_months": 2,
        "discretionary_cut_percent": 0.60,
        "discretionary_savings_monthly": 15600.00,
        "monthly_contribution_adjusted": 98000.00,
        "emergency_buffer_replenished_month": 8,
        "feasibility_score": 68.0,
        "description": "Cuts dining and entertainment by 60% immediately (saving ₹15,600/month) to preserve target deadline."
      },
      {
        "plan_id": "balanced",
        "name": "Balanced Compromise",
        "target_completion_month": 29,
        "slippage_months": 5,
        "discretionary_cut_percent": 0.25,
        "discretionary_savings_monthly": 6500.00,
        "monthly_contribution_adjusted": 88000.00,
        "emergency_buffer_replenished_month": 12,
        "feasibility_score": 92.0,
        "description": "Moderate 25% budget cut (saving ₹6,500/month) paired with a 5-month timeline extension."
      },
      {
        "plan_id": "extended",
        "name": "Extended Timeline (Zero Lifestyle Change)",
        "target_completion_month": 37,
        "slippage_months": 13,
        "discretionary_cut_percent": 0.0,
        "discretionary_savings_monthly": 0.00,
        "monthly_contribution_adjusted": 85416.67,
        "emergency_buffer_replenished_month": 18,
        "feasibility_score": 98.0,
        "description": "Preserves existing living standards while extending the target completion date by 13 months."
      }
    ]
  }
}
```

---

## 9. Goal Survival Map API (`/survival/map`)

### `POST /survival/map`
Generates a multi-scenario matrix of monthly survival and liquidity points in ₹.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "goal_id": "goal_65f1a",
    "currency": "INR",
    "months": 36,
    "insolvency_threshold": 0.00,
    "safe_buffer_threshold": 150000.00,
    "curves": {
      "baseline": [450000, 535416, 620833, 706250, 791666],
      "stressed": [450000, 535416, 500000, 465000, 315000],
      "recovered_balanced": [450000, 535416, 525000, 510000, 598000]
    }
  }
}
```

---

## 10. Gemini Explainer API (`/explain`)

### `POST /explain/scenario`
Generates an empathetic AI narrative strictly explaining verified engine results in INR (₹).

**Request Body:**
```json
{
  "simulation_id": "casc_9921",
  "engine_output": {
    "goal_name": "House Down Payment & Emergency Cushion",
    "target_amount": 2500000.00,
    "currency": "INR",
    "resilience_score": 32.1,
    "resilience_grade": "CRITICAL",
    "slippage_months": 13,
    "capital_deficit": 640000.00,
    "minimum_liquidity": -65000.00,
    "insolvency_month": 4,
    "shocks_applied": [
      "40% income reduction for 3 months starting Month 2",
      "₹1,50,000 emergency medical expense in Month 4"
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
    "executive_summary": "Your goal faces a Critical Resilience warning (Score 32.1/100). The combination of a 40% income drop and a ₹1,50,000 medical emergency shock depletes your cash reserves by Month 4, leaving a peak deficit of -₹65,000.",
    "key_findings": [
      "Target completion slips by 13 months (from Month 24 to Month 37).",
      "Total capital shortfall reaches ₹6,40,000 at your initial target deadline.",
      "Insolvency triggers in Month 4 when medical bills overlap with reduced earnings."
    ],
    "actionable_coaching": "Your immediate priority is avoiding Month 4 negative cash flow. Review the Balanced Recovery Plan to trim ₹6,500/month in discretionary spending, or temporarily pause goal contributions during months 2-4 to preserve core liquidity."
  }
}
```
