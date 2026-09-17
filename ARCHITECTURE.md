# SaveSmart — System Architecture & Design Specification

> **Version:** 1.0.0  
> **Target Audience:** Engineering Team, Subagents, Hackathon Judges  
> **Status:** Approved Baseline Architecture  

---

## 1. System Overview

SaveSmart is built upon a **Decoupled Deterministic-AI Hybrid Architecture**. 

Financial forecasting and risk testing demand absolute numerical accuracy and mathematical reproducibility. Large Language Models (LLMs) are inherently probabilistic and susceptible to numerical drift or hallucinations. Consequently, SaveSmart implements a strict **"Deterministic Wall"**:
- **The Financial Engine** (Python) handles 100% of arithmetic, simulation, cascade modeling, resilience scoring, and recovery plan optimization.
- **The Database** (MongoDB Atlas) persists verified goal states, baselines, and simulation runs.
- **The AI Explainer Layer** (Google Gemini) sits downstream as a pure read-only consumer of verified mathematical outputs, translating dry analytical metrics into empathetic, actionable user guidance.
- **The Frontend** (Next.js 15) renders responsive UI components, interactive charts (Recharts), and manages user interaction.

```
+---------------------------------------------------------------------------------------+
|                                    PRESENTATION LAYER                                 |
|                                Next.js 15 + TypeScript                                |
|  - Goal Builder UI       - Baseline Form             - Stress-Test Lab Controls       |
|  - Scenario Comparator   - Goal Survival Heatmap     - Adaptive Recovery Slider       |
|  - Recharts Visualizer   - Gemini AI Narrative Card  - Cascade Shock Sequencer        |
+-------------------------------------------+-------------------------------------------+
                                            |
                                  HTTP / JSON (REST API)
                                            |
+-------------------------------------------v-------------------------------------------+
|                                      BACKEND API                                      |
|                               Python 3.13 + FastAPI                                   |
|  - CORS & Middleware     - Pydantic v2 Validation    - Route Handlers (/api/v1)       |
|  - Dependency Injection  - Error Handling & Logging  - API Contract Enforcer          |
+-------------------+-----------------------+-----------------------+-------------------+
                    |                       |                       |
                    v                       v                       v
+-----------------------+   +-----------------------+   +-------------------------------+
|   FINANCIAL ENGINE    |   |  MONGODB ATLAS REPO   |   |     GEMINI EXPLAINER LAYER    |
| (Pure Python Math)    |   | (Motor / PyMongo)     |   | (Google Gemini API)           |
|                       |   |                       |   |                               |
| - Cashflow Timeline   |   | Collections:          |   | - Context Validator           |
| - Single Shocks       |   | - users               |   | - Prompt Assembly             |
| - Cascade Sequencer   |   | - goals               |   | - Hallucination Guardrails    |
| - Health Scorer       |   | - baselines           |   | - Markdown Explanation        |
| - Recovery Solver     |   | - shock_scenarios     |   |   (No Math Generation)        |
| - Survival Prob.      |   | - simulation_results  |   |                               |
+-----------------------+   +-----------------------+   +-------------------------------+
```

---

## 2. The Deterministic Wall & AI Boundary

To preserve mathematical integrity:
1. **Zero Math in LLM Prompts:** Gemini is never prompted to compute savings rates, timeline shifts, interest amounts, or percentages.
2. **Context-Only Ingestion:** Gemini receives structured JSON containing already computed results:
   - `resilience_score`: e.g., `42.5`
   - `baseline_completion_month`: e.g., `18`
   - `stressed_completion_month`: e.g., `26`
   - `slippage_months`: e.g., `8`
   - `total_deficit_dollars`: e.g., `4200.00`
   - `recovery_recommendations`: list of pre-calculated actions
3. **Response Schema Enforcement:** Gemini outputs structured markdown explaining *why* the score dropped and *what* the trade-offs of the recovery paths are, referencing only the provided figures.
4. **Post-Processing Guardrail Check:** A lightweight Python validator ensures the LLM's narrative contains no dollar amounts or numbers that conflict with the source calculation payload.

---

## 3. Directory Structure & Module Responsibilities

```
SaveSmart/
+-- .gitignore                      # Git ignore configuration
+-- README.md                       # Project README and quick start
+-- PROJECT_STATE.md                # Living status and milestone tracker
+-- ARCHITECTURE.md                 # System architecture (this document)
+-- API_CONTRACT.md                 # Full OpenAPI and endpoint schema spec
+-- FINANCIAL_RULES.md              # Mathematical formulas and logic spec
+-- TASK_BOARD.md                   # Multi-agent workstreams and backlog
¦
+-- backend/                        # FastAPI Backend Application
¦   +-- .env.example                # Backend environment variable template
¦   +-- requirements.txt            # Python dependencies
¦   +-- pyproject.toml              # Tooling & pytest configuration
¦   +-- main.py                     # ASGI entrypoint & FastAPI app initialization
¦   ¦
¦   +-- app/
¦   ¦   +-- __init__.py
¦   ¦   +-- core/                   # Core infrastructure
¦   ¦   ¦   +-- __init__.py
¦   ¦   ¦   +-- config.py           # Pydantic Settings & environment loader
¦   ¦   ¦   +-- security.py         # Auth utilities & token helpers
¦   ¦   ¦
¦   ¦   +-- db/                     # MongoDB Atlas database layer
¦   ¦   ¦   +-- __init__.py
¦   ¦   ¦   +-- mongodb.py          # Motor client connection lifecycle
¦   ¦   ¦   +-- repositories/       # Data Access Objects (DAOs)
¦   ¦   ¦       +-- __init__.py
¦   ¦   ¦       +-- goal_repository.py
¦   ¦   ¦       +-- baseline_repository.py
¦   ¦   ¦       +-- simulation_repository.py
¦   ¦   ¦
¦   ¦   +-- engine/                 # PURE DETERMINISTIC FINANCIAL MATH
¦   ¦   ¦   +-- __init__.py         # No FastAPI or DB imports allowed here
¦   ¦   ¦   +-- models.py           # Domain dataclasses / pure math types
¦   ¦   ¦   +-- cashflow.py         # Monthly net cash flow & trajectory calculations
¦   ¦   ¦   +-- shocks.py           # Single shock calculators (income, expense, debt)
¦   ¦   ¦   +-- cascade.py          # Multi-shock compounding sequence simulator
¦   ¦   ¦   +-- health.py           # Resilience score (0-100) & risk factor breakdown
¦   ¦   ¦   +-- recovery.py         # Optimization solver for recovery scenarios
¦   ¦   ¦   +-- survival.py         # Survival curve & insolvency threshold generator
¦   ¦   ¦
¦   ¦   +-- schemas/                # Pydantic Request & Response DTOs
¦   ¦   ¦   +-- __init__.py
¦   ¦   ¦   +-- goal.py             # Goal CRUD schemas
¦   ¦   ¦   +-- baseline.py         # Income, expense, and debt schemas
¦   ¦   ¦   +-- shock.py            # Shock parameters and cascade definitions
¦   ¦   ¦   +-- health.py           # Health score and risk metrics schemas
¦   ¦   ¦   +-- recovery.py         # Recovery plans and options schemas
¦   ¦   ¦   +-- survival.py         # Monthly projection points & survival map
¦   ¦   ¦   +-- ai.py               # Explainer request/response schemas
¦   ¦   ¦
¦   ¦   +-- services/               # Orchestration layer
¦   ¦   ¦   +-- __init__.py
¦   ¦   ¦   +-- goal_service.py     # Coordinates goal operations
¦   ¦   ¦   +-- baseline_service.py # Coordinates baseline finances
¦   ¦   ¦   +-- simulation_service.py # Bridges API to Engine & persists runs
¦   ¦   ¦   +-- recovery_service.py # Coordinates recovery optimization
¦   ¦   ¦   +-- gemini_explainer.py # Prompts Gemini with verified engine outputs
¦   ¦   ¦
¦   ¦   +-- api/                    # REST API Endpoints
¦   ¦       +-- __init__.py
¦   ¦       +-- v1/
¦   ¦           +-- __init__.py
¦   ¦           +-- router.py       # Master v1 router aggregation
¦   ¦           +-- goals.py        # /api/v1/goals routes
¦   ¦           +-- baseline.py     # /api/v1/baseline routes
¦   ¦           +-- stress_test.py  # /api/v1/stress-test routes
¦   ¦           +-- scenarios.py    # /api/v1/scenarios routes
¦   ¦           +-- recovery.py     # /api/v1/recovery routes
¦   ¦           +-- survival.py     # /api/v1/survival routes
¦   ¦           +-- explain.py      # /api/v1/explain routes
¦   ¦
¦   +-- tests/                      # Automated Test Suite
¦       +-- __init__.py
¦       +-- conftest.py             # Pytest fixtures and mock objects
¦       +-- test_cashflow_engine.py # Unit tests for cashflow trajectories
¦       +-- test_shock_engine.py    # Unit tests for individual shocks
¦       +-- test_cascade_engine.py  # Unit tests for compound cascading shocks
¦       +-- test_health_scoring.py  # Unit tests for resilience score formulas
¦       +-- test_recovery_solver.py # Unit tests for recovery recommendations
¦       +-- test_gemini_guardrails.py # Guardrail checks on AI output
¦       +-- test_api_endpoints.py   # FastAPI TestClient endpoint integration tests
¦
+-- frontend/                       # Next.js 15 Client Application
    +-- .env.example                # Frontend environment variable template
    +-- package.json                # Dependencies & scripts
    +-- tsconfig.json               # TypeScript config
    +-- next.config.ts              # Next.js config
    +-- tailwind.config.ts          # Tailwind styling system
    ¦
    +-- src/
        +-- app/                    # Next.js App Router pages
        ¦   +-- layout.tsx          # Root layout with navbar and footer
        ¦   +-- page.tsx            # Landing page & resilience dashboard
        ¦   +-- goals/              # Goal management page
        ¦   +-- baseline/           # Financial profile & cashflow entry
        ¦   +-- stress-test/        # Interactive shock lab & cascade simulator
        ¦   +-- recovery/           # Plan comparator & strategy selector
        ¦   +-- survival/           # Survival map & insolvency timeline
        ¦
        +-- components/             # Modular UI components
        ¦   +-- ui/                 # Atomic buttons, inputs, dialogs, badges
        ¦   +-- charts/             # Recharts wrappers (SurvivalChart, ComparatorChart)
        ¦   +-- goal/               # GoalCard, GoalForm, GoalHealthBadge
        ¦   +-- baseline/           # IncomeCard, ExpenseBreakdown, DebtList
        ¦   +-- stress-test/        # ShockSelector, CascadeTimeline, ShockSlider
        ¦   +-- recovery/           # RecoveryPlanCard, StrategyToggle
        ¦   +-- ai/                 # GeminiNarrativeBox, RiskExplanationCard
        ¦
        +-- hooks/                  # Custom React hooks (useSimulation, useBaseline)
        +-- lib/                    # Utilities & HTTP Client
        ¦   +-- api-client.ts       # Type-safe fetch client for backend
        ¦   +-- utils.ts            # Formatting (currency, date, percentage)
        ¦
        +-- types/                  # Shared TypeScript Interfaces (Mirrors Pydantic)
            +-- api.ts              # Generic API response shapes
            +-- goal.ts             # Goal data models
            +-- baseline.ts         # Baseline finance models
            +-- simulation.ts       # Shocks & cascade simulation models
            +-- recovery.ts         # Recovery options & strategies
            +-- ai.ts               # AI explanation response models
```

---

## 4. Database Design (MongoDB Atlas)

### 4.1. Collections Overview

| Collection | Key Responsibility | Index Strategy |
| :--- | :--- | :--- |
| `users` | User credentials, preferences, demo session ID | `email` (unique), `session_id` |
| `goals` | Target amount, current balance, target date, priority | `user_id`, `created_at` |
| `baselines` | Income sources, fixed costs, discretionary spending, debts | `user_id` (unique per user) |
| `simulation_results` | Historic simulation runs, shock parameters, resulting curves | `user_id`, `goal_id`, `created_at` |
| `recovery_plans` | Selected recovery strategy, action items, target adjustments | `user_id`, `goal_id` |

### 4.2. Document Schema Specifications

#### 1. `goals` Collection
```json
{
  "_id": "ObjectId('65f123456789abcdef01')",
  "user_id": "demo_user_01",
  "name": "Emergency Cushion & House Down Payment",
  "category": "housing",
  "target_amount": 25000.00,
  "current_balance": 4500.00,
  "target_months": 24,
  "priority": "high",
  "created_at": "2026-09-18T00:00:00Z",
  "updated_at": "2026-09-18T00:00:00Z"
}
```

#### 2. `baselines` Collection
```json
{
  "_id": "ObjectId('65f123456789abcdef02')",
  "user_id": "demo_user_01",
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
      "name": "Car Loan",
      "monthly_payment": 350.00,
      "remaining_balance": 8400.00,
      "interest_rate_annual": 0.055
    }
  ],
  "emergency_fund_balance": 3000.00,
  "updated_at": "2026-09-18T00:00:00Z"
}
```

#### 3. `simulation_results` Collection
```json
{
  "_id": "ObjectId('65f123456789abcdef03')",
  "user_id": "demo_user_01",
  "goal_id": "ObjectId('65f123456789abcdef01')",
  "simulation_type": "cascade",
  "shocks_applied": [
    {
      "shock_type": "income_drop",
      "start_month": 3,
      "duration_months": 4,
      "magnitude_percent": 0.40
    },
    {
      "shock_type": "lump_sum_expense",
      "start_month": 5,
      "amount": 2500.00,
      "category": "medical_emergency"
    }
  ],
  "results": {
    "resilience_score": 48.2,
    "status": "vulnerable",
    "baseline_completion_month": 23,
    "stressed_completion_month": 31,
    "slippage_months": 8,
    "minimum_liquidity_month": 6,
    "minimum_liquidity_amount": -650.00,
    "insolvency_risk": true
  },
  "created_at": "2026-09-18T00:00:00Z"
}
```

---

## 5. Parallel Multi-Agent Workstream Boundaries

To ensure 5 parallel development streams proceed with **zero file collisions**:

```
+---------------------+-------------------------------+------------------------------------------+
| Workstream          | Primary Directory Scope       | File Boundaries                          |
+---------------------+-------------------------------+------------------------------------------+
| WS-A: Financial Math| backend/app/engine/           | models.py, cashflow.py, shocks.py,       |
|                     |                               | cascade.py, health.py, recovery.py       |
|                     | backend/tests/test_*.py       | Math tests only                          |
+---------------------+-------------------------------+------------------------------------------+
| WS-B: Backend & DB  | backend/app/api/v1/           | router.py, goals.py, baseline.py,        |
|                     | backend/app/schemas/          | stress_test.py, scenarios.py             |
|                     | backend/app/db/               | mongodb.py, repositories/*               |
|                     | backend/app/services/         | goal_service.py, baseline_service.py     |
+---------------------+-------------------------------+------------------------------------------+
| WS-C: AI Explainer  | backend/app/services/         | gemini_explainer.py                      |
|                     | backend/app/api/v1/           | explain.py                               |
|                     | backend/tests/                | test_gemini_guardrails.py                |
+---------------------+-------------------------------+------------------------------------------+
| WS-D: Frontend UI   | frontend/src/app/             | pages, layout                            |
|                     | frontend/src/components/      | all UI & chart widgets                   |
|                     | frontend/src/types/           | TypeScript contract mirroring            |
|                     | frontend/src/lib/             | api-client.ts, utils.ts                  |
+---------------------+-------------------------------+------------------------------------------+
| WS-E: QA & E2E      | backend/tests/                | integration tests, stress test benchmarks|
+---------------------+-------------------------------+------------------------------------------+
```

---

## 6. Execution Flow Diagrams

### 6.1. Stress-Test Execution Flow
```
User clicks [Run Stress Test]
  --> Frontend calls POST /api/v1/stress-test/simulate
    --> FastAPI validates request payload against ShockRequest schema
      --> SimulationService loads Baseline & Goal from MongoDB
        --> FinancialEngine.simulate_shocks(baseline, goal, shocks)
            - Step 1: Compute month-by-month cashflow
            - Step 2: Apply income reductions & expense spikes
            - Step 3: Deplete/replenish emergency buffer
            - Step 4: Evaluate goal trajectory & slippage
            - Step 5: Compute Resilience Score (0-100)
        --> MongoDB stores simulation result snapshot
    --> FastAPI returns Verified Simulation JSON to Frontend
  --> Frontend renders Recharts comparison curve and Resilience Score
  --> Frontend requests POST /api/v1/explain/scenario (passes verified JSON)
    --> GeminiExplainer generates human narrative strictly referencing figures
  --> Frontend renders Gemini AI Insights card
```

---

## 7. Security, Resiliency, and Fallback Strategy

1. **Deterministic Engine Independence:** The financial engine has zero external network calls. If MongoDB or Gemini are unavailable, the engine can execute in-memory.
2. **Gemini Fallback:** If Gemini API times out or rate limits (`429`), the backend returns a deterministic fallback template summary generated via Python rule-based strings so the user is never blocked.
3. **Environment Security:** API keys (`GEMINI_API_KEY`, `MONGODB_URI`) are strictly loaded via `backend/app/core/config.py` from `.env` and never committed or exposed to the client.
