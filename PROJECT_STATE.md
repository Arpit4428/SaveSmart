# SaveSmart — Project State & Status

> **Hackathon Track:** Fintech / Financial Resilience & Goal Stress-Testing  
> **Currency Standard:** Indian Rupee (INR / ₹)  
> **Status:** Phase 1 (Engine + Backend + MongoDB), Phase 2 (Next.js 15 Frontend UI), and Phase 3 (SaveSmart Differentiation Features) COMPLETED.  
> **Last Updated:** 2026-09-18  

---

## 1. Executive Summary & Value Proposition

**SaveSmart** is a financial resilience platform designed to bridge the gap between static personal financial planning and volatile real-world shocks. Traditional budgeting apps calculate savings goals under an unrealistic assumption: that life proceeds without disruption.

SaveSmart empowers everyday savers to:
1. **Model** realistic goals, baseline cash flows, fixed commitments, and discretionary buffers in Indian Rupees (INR / ₹).
2. **Stress-test** their goals against sudden income shocks, expense spikes, inflation jumps, or interest rate hikes.
3. **Simulate cascading crises** (e.g., job loss followed by emergency medical expenses) to uncover hidden liquidity cliff-edges.
4. **Evaluate goal health** with a multi-dimensional Resilience Score (0–100) and pinpoint target date slippage and capital deficits.
5. **Generate deterministic, actionable recovery plans** (Aggressive, Balanced, Extended Timeline) with zero guesswork.
6. **Understand their financial reality** through an AI explanation layer powered by Google Gemini that strictly explains verified engine numbers without fabricating or altering financial figures.

---

## 2. Tech Stack Decisions

| Layer | Technology | Decision Rationale |
| :--- | :--- | :--- |
| **Currency Standard** | **INR / ₹ (Indian Rupee)** | Standardized two-decimal numeric representation throughout engine, API, database, and UI. |
| **Frontend** | **Next.js 15 (App Router) + TypeScript** | Server components for rapid loading, strict typing for financial data integrity, and fast client-side reactivity for simulations. |
| **Styling & UI** | **Tailwind CSS + Radix/Lucide** | Rapid design-system prototyping with modern, accessible, fintech-grade components. |
| **Data Visualization** | **Recharts** | Smooth interactive time-series visualizations for Goal Survival Maps, cash-flow runaways, and multi-scenario comparisons. |
| **Backend API** | **Python 3.13 + FastAPI** | High-performance asynchronous API, native Pydantic v2 data validation, and seamless interop with deterministic Python financial math. |
| **Financial Engine** | **Pure Deterministic Python** | Isolated math modules with zero probabilistic or floating-point hallucination. 100% test-covered and reproducible. |
| **Database** | **MongoDB Atlas (Motor / PyMongo)** | Flexible document schema for versioned user scenarios, shock simulations, custom shock parameters, and recovery strategies. |
| **AI Explanation Layer**| **Google Gemini API (`gemini-1.5-pro` / `gemini-2.0-flash`)** | Interprets verified simulation outputs into empathetic, plain-language financial narratives, strictly prohibited from calculating numbers. |
| **Version Control & CI**| **GitHub + Git** | Branch protection, clear pull request contracts, and isolated multi-agent workstream branches. |
| **Deployment Target** | **Vercel** (Frontend) + **Render/Railway** (Backend) | Production-ready cloud targets with zero DevOps overhead during hackathon demos. |

---

## 3. Core Feature Matrix & Implementation Status

| ID | Feature Name | Description | Module Path | Status | Primary Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **F-01** | **Goal Builder** | Define target amount (₹), deadline, priority, category, and initial balance. | `backend/app/api/v1/goals.py`<br>`frontend/src/app/goals/` | ✅ Complete | Backend + Frontend |
| **F-02** | **Financial Baseline** | Track net income, fixed obligations, discretionary spending, emergency savings, and debt liabilities (all in ₹). | `backend/app/api/v1/baseline.py`<br>`frontend/src/app/baseline/` | ✅ Complete | Backend + Financial Engine |
| **F-03** | **Stress-Test Lab** | Apply single shocks (income loss, medical spike, inflation, loan hike) to project impact. | `backend/app/engine/shocks.py`<br>`frontend/src/app/stress-test/` | ✅ Complete | Financial Engine |
| **F-04** | **Goal Health Score** | Compute Resilience Score (0–100), Target Slippage (months), Buffer Runaway, Deficit (₹), and 5-axis Fingerprint. | `backend/app/engine/health.py`<br>`frontend/src/app/goals/` | ✅ Complete | Financial Engine |
| **F-05** | **Scenario Comparator** | Side-by-side comparison of baseline trajectory vs. stressed scenarios. | `backend/app/api/v1/survival.py`<br>`frontend/src/components/charts/` | ✅ Complete | Frontend + Engine |
| **F-06** | **Adaptive Recovery Planner** | Solves 3 deterministic recovery paths (Aggressive, Balanced, Extended) with visual trajectory comparator & trade-off matrix. | `backend/app/engine/recovery.py`<br>`frontend/src/app/recovery/` | ✅ Complete | Financial Engine |
| **F-07** | **Goal Survival Map** | Multi-month timeline projection with Survival Verdict, first unsafe month, max drawdown, shortfall, and buffer runway in ₹. | `backend/app/engine/survival.py`<br>`frontend/src/app/survival/` | ✅ Complete | Financial Engine + Frontend |
| **F-08** | **Cascade Mode** | Financial Chain Reaction sequencer simulating compounding multi-shock transmission with deterministic failure diagnosis. | `backend/app/engine/cascade.py`<br>`frontend/src/app/stress-test/` | ✅ Complete | Financial Engine |
| **F-09** | **Gemini Explainer Layer** | Ingests verified simulation JSON and generates executive summaries and coaching without altering numbers. | `backend/app/services/gemini_explainer.py`<br>`frontend/src/components/ai/` | 📝 Planned (Phase 4) | AI & Integration |

---

## 4. Architectural Cardinal Rule

```
                                    +--------------------------------+
                                    |    User Inputs & Scenarios     |
                                    |        (INR / ₹ values)        |
                                    +---------------+----------------+
                                                    |
                                                    v
                                    +--------------------------------+
                                    |   FastAPI REST API / Engine    |
                                    |  (100% Deterministic Python)   |
                                    +---------------+----------------+
                                                    |
                         +--------------------------+--------------------------+
                         |                                                     |
                         v                                                     v
          +-----------------------------+                       +-----------------------------+
          |  Verified Calculation JSON   |                       |    MongoDB Atlas Storage    |
          |  (Rupee (₹) amounts, months,|                       |  (Goals, baseline, runs)    |
          |   scores, recovery steps)   |                       +-----------------------------+
          +--------------+--------------+
                         |
                         | (Read-only verified input context in ₹)
                         v
          +-----------------------------+
          |    Gemini Explainer Layer   |
          |  - NEVER alters numbers     |
          |  - NEVER invents math/₹     |
          |  - Explains trade-offs only |
          +--------------+--------------+
                         |
                         v
          +-----------------------------+
          | Next.js Frontend Dashboard  |
          | (Recharts ₹ + AI Narrative) |
          +-----------------------------+
```

> **Strict Rule**: Gemini is treated strictly as an **explainer and narrator**, never a calculator. Gemini receives pure JSON payloads containing verified mathematical values in INR (₹) produced by the deterministic Python financial engine. Gemini's system instructions explicitly forbid generating or modifying numbers or currency values.

---

## 5. Active Workstreams & Multi-Agent Structure

1. **Workstream A: Financial Engine Core (`/backend/app/engine/`)**
   - Independent pure Python logic with pytest suites. Standardized on INR float / decimal calculations. No web framework or DB dependencies.
2. **Workstream B: Backend API & MongoDB Atlas (`/backend/app/api/`, `/backend/app/db/`)**
   - FastAPI endpoints, Pydantic schemas, Motor/PyMongo repositories, dependency injection.
3. **Workstream C: Gemini Explainer Layer (`/backend/app/services/gemini_explainer.py`)**
   - Prompt engineering, guardrail schema verification ensuring strict fidelity to engine INR outputs, structured Markdown generation.
4. **Workstream D: Frontend UI & Visualization (`/frontend/`)**
   - Next.js 15, Recharts, Tailwind CSS, typed API client with INR (₹) currency formatters matching `API_CONTRACT.md`.
5. **Workstream E: QA, Verification & Benchmarks (`/backend/tests/`)**
   - Math regression tests, edge-case shock scenarios in INR, API contract tests.

---

## 6. Immediate Next Steps

1. Review and approve `ARCHITECTURE.md`, `API_CONTRACT.md`, `FINANCIAL_RULES.md`, and `TASK_BOARD.md`.
2. Commit initial architecture foundation to Git `main`.
3. Launch Workstream A (Deterministic Financial Engine) and Workstream B (Backend Models & Schemas) in parallel.
