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

### Phase 1: Core Engine Math & Backend Schemas (COMPLETED)

#### Workstream A: Financial Engine
- [x] **TASK-A01**: Implement `backend/app/engine/models.py` (Domain dataclasses: `BaselineProfile`, `GoalSpec`, `ShockEvent`, `MonthlySnapshot`).
- [x] **TASK-A02**: Implement `backend/app/engine/cashflow.py` (Monthly cash flow generator and baseline goal trajectory in ₹).
- [x] **TASK-A03**: Implement `backend/app/engine/shocks.py` (Single shock solvers: income drop, lump-sum spike, inflation, interest rates).
- [x] **TASK-A04**: Implement `backend/app/engine/cascade.py` (Sequential compound shock simulation and buffer drawdown).
- [x] **TASK-A05**: Implement `backend/app/engine/health.py` (Resilience score 0-100 algorithm, fingerprint, and risk factor diagnostics).
- [x] **TASK-A06**: Implement `backend/app/engine/recovery.py` (Deterministic solver for Aggressive, Balanced, Extended recovery plans).
- [x] **TASK-A07**: Implement `backend/app/engine/survival.py` (Goal survival timeline, verdict, shortfall, drawdown, and insolvency matrices).
- [x] **TASK-A08**: Write comprehensive Pytest test suite in `backend/tests/` covering all edge cases (36/36 tests passing).

#### Workstream B: Backend API & MongoDB
- [x] **TASK-B01**: Create `backend/requirements.txt` & configure FastAPI with CORS, settings in `backend/app/core/config.py`.
- [x] **TASK-B02**: Setup Motor MongoDB connection lifecycle in `backend/app/db/mongodb.py`.
- [x] **TASK-B03**: Implement Pydantic schemas in `backend/app/schemas/` matching `API_CONTRACT.md` (denominating monetary fields in INR).
- [x] **TASK-B04**: Implement MongoDB repositories in `backend/app/db/repositories/` (`goal_repository.py`, `baseline_repository.py`).
- [x] **TASK-B05**: Implement `/api/v1/goals` CRUD endpoints.
- [x] **TASK-B06**: Implement `/api/v1/baseline` profile management endpoints.
- [x] **TASK-B07**: Implement `/api/v1/stress-test/simulate` and `/api/v1/stress-test/cascade` route handlers.
- [x] **TASK-B08**: Implement `/api/v1/recovery/plans` and `/api/v1/survival/map` route handlers.

---

### Phase 2: Frontend Implementation & Integration (COMPLETED)

#### Workstream D: Frontend UI & Visualization
- [x] **TASK-D01**: Initialize Next.js 15 TypeScript project with Tailwind CSS in `frontend/`.
- [x] **TASK-D02**: Setup TypeScript interfaces in `frontend/src/types/` matching `API_CONTRACT.md`.
- [x] **TASK-D03**: Implement type-safe HTTP client and INR currency formatter in `frontend/src/lib/api-client.ts` and `frontend/src/lib/utils.ts`.
- [x] **TASK-D04**: Build Global Navigation, Theme Provider, and Dashboard Shell (`frontend/src/app/layout.tsx`).
- [x] **TASK-D05**: Build Goal Builder & Baseline Management Forms (`frontend/src/app/goals/`, `frontend/src/app/baseline/`).
- [x] **TASK-D06**: Implement Recharts visualization components (`SurvivalChart.tsx`, `BufferRunwayChart.tsx`, `RecoveryChart.tsx`).
- [x] **TASK-D07**: Build Stress-Test Lab with interactive shock sliders and Cascade timeline sequencer (`frontend/src/app/stress-test/`).
- [x] **TASK-D08**: Build Adaptive Recovery Plan selector with comparison cards (`frontend/src/app/recovery/`).

---

### Phase 3: SaveSmart Differentiation Features (COMPLETED)
- [x] **TASK-DIFF01**: Goal Survival Map upgrade: "Will my goal survive?" verdict, first unsafe month, max drawdown, slippage, shortfall, recovery point, and liquid buffer runway chart.
- [x] **TASK-DIFF02**: Cascade Mode upgrade: Financial Chain Reaction Sequencer with step-by-step mathematical transmission cards.
- [x] **TASK-DIFF03**: Adaptive Recovery Path Simulator: Recharts trajectory comparator for Aggressive vs. Balanced vs. Extended, buffer preserved, and trade-off matrix ("What it costs you").
- [x] **TASK-DIFF04**: Deterministic Failure Diagnosis: "Why Did My Goal Fail / Become Fragile?" 5-step root cause breakdown without Gemini.
- [x] **TASK-DIFF05**: Financial Resilience Fingerprint: 5-axis durability profile (Buffer Strength, Flexibility, Debt Pressure, Goal Capacity Cushion, Recovery Velocity).
- [x] **TASK-DIFF06**: Transparent Assumptions Ledger: Collapsible verified parameter ledger on all simulation views.

---

### Phase 4: Gemini Explanation Layer (COMPLETED)
- [x] **TASK-GEM01**: Backend Gemini Service using `google-genai` SDK with strict JSON schema outputs and zero-leakage security.
- [x] **TASK-GEM02**: Hallucination Firewall: Validation layer intercepting fabricated financial claims and strictly prohibiting investment/loan advice.
- [x] **TASK-GEM03**: Deterministic Fallback Explainer: High-fidelity natural language explanations generated deterministically when Gemini is unavailable.
- [x] **TASK-GEM04**: `POST /api/v1/explain/scenario` endpoint returning verified calculations, structured AI narrative, and engine disclaimer.
- [x] **TASK-GEM05**: Frontend `<AIExplanationCard />` component embedded across Goal Health, Stress-Test, Recovery, and Survival views.
- [x] **TASK-GEM06**: 100% mocked Pytest test suite for Gemini & Hallucination Firewall (9 new unit tests, 45/45 total passed).
- [x] **TASK-GEM07**: Playwright E2E QA automation testing all AI explanation workflows with 0 console or network errors.

---

### Phase 5: Product Polish & Hackathon Demo Readiness (COMPLETED)
- [x] **TASK-POLISH01**: Narrative UX Optimization: Next-step transitions connecting entire flow (Baseline ➔ Goals ➔ Stress-Test ➔ Recovery ➔ Survival) with attention alerts on overcommitment.
- [x] **TASK-POLISH02**: 5-Second Chart Readability: Recharts ReferenceLines for Unsafe Point M{N}, Recovery Point M{N}, Target Goal Amount, and Target Deadline Months.
- [x] **TASK-POLISH03**: Terminology & Disclosure Refinement: Replaced arbitrary "Recommended" strategy label with neutral trade-off profiles (Pressure, Lifestyle Cuts, Delay, Buffer); updated AI explanation loading text to "checked for numerical consistency with verified financial results".
- [x] **TASK-POLISH04**: 1-Click Demo Presets: Built interactive `<DemoPresetModal />` and backend `seed_demo_data.py` loading 3 realistic Indian financial resilience personas (Homebuyer, Wedding, Startup Founder).
- [x] **TASK-POLISH05**: Mobile & Viewport Responsiveness: Responsive horizontal sub-nav in layout, multi-column adaptivity, and tested 375x667 mobile viewports.
- [x] **TASK-POLISH06**: Comprehensive Multi-Tier Validation: 45/45 Pytest tests passing, Next.js production build cleanly compiled with icon.svg, Playwright E2E passed with 0 console errors, 0 uncaught errors, and 0 network failures.
