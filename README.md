# SaveSmart 🛡️💰
> **Fintech Financial Resilience & Goal Stress-Testing Platform**  
> *Built for Hackathon 2026*

---

## What is SaveSmart?

Most savings apps show a straight line to your goal. Life is not a straight line.

**SaveSmart** tests your financial goals against the unpredictable:
- What happens if you face a **30% income drop** for 4 months?
- What happens if an unexpected **₹2,50,000 medical bill** hits while inflation spikes?
- What happens during a **cascading crisis** (job disruption + emergency expenses + interest hike)?

SaveSmart calculates your **Resilience Score (0–100)**, projects your **Goal Survival Map**, and deterministically formulates **3 actionable recovery plans** to get you back on track.

---

## 🏛️ Architectural Cardinal Rule

```
+------------------------------------+
|  Deterministic Python Engine       |  <-- 100% of math, shocks, cash flow,
|  (Pure Math, 0% Hallucination)     |      and recovery optimization
+-----------------+------------------+
                  |
                  | (Verified JSON Payload in INR / ₹)
                  v
+------------------------------------+
|  Gemini AI Explainer Layer         |  <-- Explains trade-offs & impacts
|  (Strictly forbidden to do math)   |      using ONLY verified engine numbers
+------------------------------------+
```

---

## 📦 Tech Stack

- **Currency Standard:** Indian Rupee (INR / ₹) across all baselines, goals, and projections
- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, Recharts
- **Backend:** Python 3.13, FastAPI, Pydantic v2
- **Database:** MongoDB Atlas (Motor / PyMongo)
- **AI Layer:** Google Gemini API (Strictly read-only explanation)
- **Version Control:** Git & GitHub

---

## 🚀 Quick Start (Local Development)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Unix/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```
Swagger API docs available at: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```
Application interface available at: `http://localhost:3000`

---

## 📚 Documentation Index

- [PROJECT_STATE.md](PROJECT_STATE.md): Vision, status, feature matrix, and milestones.
- [ARCHITECTURE.md](ARCHITECTURE.md): System architecture, component boundaries, and data flows.
- [API_CONTRACT.md](API_CONTRACT.md): Comprehensive REST API request/response specifications.
- [FINANCIAL_RULES.md](FINANCIAL_RULES.md): Deterministic formulas, scoring algorithms, and guardrails.
- [TASK_BOARD.md](TASK_BOARD.md): Multi-agent workstream board and backlog.
