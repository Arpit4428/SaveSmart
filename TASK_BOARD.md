# SaveSmart — Multi-Agent Task Board & Parallel Execution Plan

> **Strategy:** Strict file and module segregation allowing up to 5 agents or developers to work concurrently without merge conflicts.  
> **Currency Standard:** Indian Rupee (INR / ₹)  
> **Phase 0 Status:** COMPLETED  
> **Phase 1 Target:** Core Engine Math + Backend API Scaffolding  

---

## 1. Workstream Ownership Matrix

| Workstream | Lead Agent Role | Allowed Directory Scope | Prohibited Directories |
| :--- | :--- | :--- | :--- |
| **WS-A: Financial Engine** | Financial Math Engineer | `backend/app/engine/`<br>`backend/tests/test_*.py` | `frontend/`, `backend/app/api/` |
| **WS-B: Backend API & DB** | Backend Systems Engineer | `backend/app/api/`<br>`backend/app/schemas/`<br>`backend/app/db/`<br>`backend/app/services/` (except AI) | `backend/app/engine/` (read-only import), `frontend/` |
| **WS-C: AI Explainer** | AI & Prompt Engineer | `backend/app/services/gemini_explainer.py`<br>`backend/app/api/v1/explain.py`<br>`backend/app/schemas/ai.py` | `backend/app/engine/` |
| **WS-D: Frontend UI** | Frontend & UX Engineer | `frontend/src/` | `backend/` |
| **WS-E: QA & Benchmarks** | Test & Validation Engineer| `backend/tests/`<br>`docs/benchmarks/` | Production application code without PR review |

---

## 2. Phase-by-Phase Implementation Roadmap

```
+-----------------------------------------------------------------------------------------+
| PHASE 0: Architecture, Contracts, & Workstream Isolation (DONE)                         |
+-----------------------------------------------------------------------------------------+
                                             |
                     +-----------------------+-----------------------+
                     |                                               |
                     v                                               v
+------------------------------------------+   +------------------------------------------+
| PHASE 1A: Deterministic Financial Engine  |   | PHASE 1B: Backend Models & API Scaffolding|
| (WS-A: Pure Python Math in ₹ + Pytest)   |   | (WS-B: FastAPI, Motor DB, Schemas)       |
+------------------------------------------+   +------------------------------------------+
                     |                                               |
                     +-----------------------+-----------------------+
                                             |
                     +-----------------------+-----------------------+
                     |                                               |
                     v                                               v
+------------------------------------------+   +------------------------------------------+
| PHASE 2A: Gemini AI Explainer Layer      |   | PHASE 2B: Frontend Scaffold & Dashboard   |
| (WS-C: Guardrails, Prompts in ₹, Tests)  |   | (WS-D: Next.js 15, Layouts, Recharts ₹)  |
+------------------------------------------+   +------------------------------------------+
                     |                                               |
                     +-----------------------+-----------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
| PHASE 3: Feature Assembly & UI-Engine Wiring                                             |
| (Goal Builder, Shock Lab, Cascade Sequencer, Recovery Slider, Survival Map)             |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
| PHASE 4: End-to-End Stress Testing, Demo Data Seeding (INR) & Deployment                |
+-----------------------------------------------------------------------------------------+
```

---

## 3. Detailed Task Backlog

### Phase 0: Setup & Architecture (Current Phase)
- [x] **TASK-001**: Initialize Git repository and `.gitignore` (Owner: Lead Architect)
- [x] **TASK-002**: Draft `PROJECT_STATE.md` with product vision, INR currency standard, and feature tracking (Owner: Lead Architect)
- [x] **TASK-003**: Draft `ARCHITECTURE.md` with system diagrams and component boundaries (Owner: Lead Architect)
- [x] **TASK-004**: Draft `API_CONTRACT.md` with complete REST schemas in INR / ₹ (Owner: Lead Architect)
- [x] **TASK-005**: Draft `FINANCIAL_RULES.md` with mathematical formulas and scoring rules (Owner: Lead Architect)
- [x] **TASK-006**: Draft `TASK_BOARD.md` and establish agent boundaries (Owner: Lead Architect)
- [x] **TASK-007**: Scaffold directory tree for backend and frontend (Owner: Lead Architect)
- [x] **TASK-008**: Commit initial architecture baseline to Git (Owner: Lead Architect)
- [x] **TASK-009**: Audit and standardize all currency references to INR / ₹ (Owner: Lead Architect)

---

### Phase 1: Core Engine Math & Backend Schemas

#### Workstream A: Financial Engine
- [ ] **TASK-A01**: Implement `backend/app/engine/models.py` (Domain dataclasses: `BaselineProfile`, `GoalSpec`, `ShockEvent`, `MonthlySnapshot`).
- [ ] **TASK-A02**: Implement `backend/app/engine/cashflow.py` (Monthly cash flow generator and baseline goal trajectory in ₹).
- [ ] **TASK-A03**: Implement `backend/app/engine/shocks.py` (Single shock solvers: income drop, lump-sum spike, inflation, interest rates).
- [ ] **TASK-A04**: Implement `backend/app/engine/cascade.py` (Sequential compound shock simulation and buffer drawdown).
- [ ] **TASK-A05**: Implement `backend/app/engine/health.py` (Resilience score 0-100 algorithm and risk factor diagnostics).
- [ ] **TASK-A06**: Implement `backend/app/engine/recovery.py` (Deterministic solver for Aggressive, Balanced, Extended recovery plans).
- [ ] **TASK-A07**: Implement `backend/app/engine/survival.py` (Goal survival timeline and insolvency threshold matrices).
- [ ] **TASK-A08**: Write comprehensive Pytest test suite in `backend/tests/` covering all edge cases (100% math coverage).

#### Workstream B: Backend API & MongoDB
- [ ] **TASK-B01**: Create `backend/requirements.txt` & configure FastAPI with CORS, settings in `backend/app/core/config.py`.
- [ ] **TASK-B02**: Setup Motor MongoDB connection lifecycle in `backend/app/db/mongodb.py`.
- [ ] **TASK-B03**: Implement Pydantic schemas in `backend/app/schemas/` matching `API_CONTRACT.md` (denominating monetary fields in INR).
- [ ] **TASK-B04**: Implement MongoDB repositories in `backend/app/db/repositories/` (`goal_repository.py`, `baseline_repository.py`).
- [ ] **TASK-B05**: Implement `/api/v1/goals` CRUD endpoints.
- [ ] **TASK-B06**: Implement `/api/v1/baseline` profile management endpoints.
- [ ] **TASK-B07**: Implement `/api/v1/stress-test/simulate` and `/api/v1/stress-test/cascade` route handlers.
- [ ] **TASK-B08**: Implement `/api/v1/recovery/plans` and `/api/v1/survival/map` route handlers.

---

### Phase 2: AI Explainer Layer & Frontend Scaffolding

#### Workstream C: Gemini Explainer Layer
- [ ] **TASK-C01**: Implement Gemini client wrapper with API key loading and safety settings in `backend/app/services/gemini_explainer.py`.
- [ ] **TASK-C02**: Create system prompt templates instructing Gemini to explain verified numbers in INR (₹) without calculating or modifying values.
- [ ] **TASK-C03**: Implement post-generation guardrail validator (`verify_gemini_narrative`) to catch hallucinated amounts or percentages.
- [ ] **TASK-C04**: Implement `/api/v1/explain/scenario` and `/api/v1/explain/recovery` endpoints with deterministic fallback string templates.

#### Workstream D: Frontend UI & Visualization
- [ ] **TASK-D01**: Initialize Next.js 15 TypeScript project with Tailwind CSS in `frontend/`.
- [ ] **TASK-D02**: Setup TypeScript interfaces in `frontend/src/types/` matching `API_CONTRACT.md`.
- [ ] **TASK-D03**: Implement type-safe HTTP client and INR currency formatter in `frontend/src/lib/api-client.ts` and `frontend/src/lib/utils.ts`.
- [ ] **TASK-D04**: Build Global Navigation, Theme Provider, and Dashboard Shell (`frontend/src/app/layout.tsx`).
- [ ] **TASK-D05**: Build Goal Builder & Baseline Management Forms (`frontend/src/app/goals/`, `frontend/src/app/baseline/`).
- [ ] **TASK-D06**: Implement Recharts visualization components (`SurvivalChart.tsx`, `ScenarioComparatorChart.tsx`, `ResilienceGauge.tsx`).
- [ ] **TASK-D07**: Build Stress-Test Lab with interactive shock sliders and Cascade timeline sequencer (`frontend/src/app/stress-test/`).
- [ ] **TASK-D08**: Build Adaptive Recovery Plan selector with comparison cards (`frontend/src/app/recovery/`).
- [ ] **TASK-D09**: Build AI Explanation Insights card with badge indicators and coaching bullets (`frontend/src/components/ai/`).

---

### Phase 3 & 4: Integration, Demo Seeding, and Polish
- [ ] **TASK-INT01**: Wire Frontend state to Backend REST API.
- [ ] **TASK-INT02**: Create demo seed script (`backend/seed_demo_data.py`) with rich pre-loaded realistic Indian financial scenarios:
  - Scenario 1: "First-Time Homebuyer" (₹25,00,000 target, ₹1,20,000/mo income, Tech Layoff Shock)
  - Scenario 2: "Wedding Fund" (₹15,00,000 target, ₹85,000/mo income, Medical Emergency + Inflation Cascade)
  - Scenario 3: "Entrepreneur Safety Net" (₹10,00,000 target, ₹1,50,000/mo income, Extended Revenue Drought)
- [ ] **TASK-INT03**: End-to-end user verification and presentation walkthrough.
