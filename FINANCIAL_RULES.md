# SaveSmart — Financial Engine Mathematics & Deterministic Rules

> **Status:** Definitive Mathematical Specification  
> **Rule:** All calculations MUST be implemented in pure Python (`backend/app/engine/`).  
> **Rule:** No floating-point random drift. Gemini is strictly prohibited from altering or generating any of these numbers.  

---

## 1. Core Variables & Time Conventions

All calculations are evaluated over a discrete monthly timeline $t \in \{0, 1, 2, \dots, T_{max}\}$, where:
- $t = 0$ represents the present day (initial state).
- $t = 1$ represents the end of the first month.
- Currency values are represented in two-decimal precision floating-point / decimal arithmetic.
- All interest and inflation percentages are represented as decimals ($5\% = 0.05$).

---

## 2. Baseline Financial Math

### 2.1. Net Monthly Free Cash Flow ($FCF$)

$$FCF = I_{net} - (E_{fixed} + E_{discretionary} + D_{commitments})$$

Where:
- $I_{net}$: Total monthly net take-home income.
- $E_{fixed}$: Sum of non-negotiable living expenses (rent/mortgage, utilities, essential groceries, insurance).
- $E_{discretionary}$: Sum of flexible spending (dining, recreation, shopping, luxuries).
- $D_{commitments}$: Monthly minimum debt payments and loan obligations.

### 2.2. Baseline Goal Contribution ($C_{target}$)

Given a goal target amount $G_{target}$, initial balance $S_0$, and target horizon in months $T_{goal}$:

$$C_{target} = \frac{G_{target} - S_0}{T_{goal}}$$

**Constraint:** Feasibility requires $C_{target} \le FCF$. If $C_{target} > FCF$, the goal is unviable in baseline state, generating a `BaselineDeficitWarning`.

### 2.3. Baseline Savings Accumulation ($S_t$)

In the absence of shocks, goal savings grow deterministically:

$$S_t = S_{t-1} + C_{target} = S_0 + (C_{target} \times t)$$

Completion occurs at $t_{comp}^{base}$ where $S_{t} \ge G_{target}$:

$$t_{comp}^{base} = \lceil \frac{G_{target} - S_0}{C_{target}} \rceil = T_{goal}$$

---

## 3. Shock Mathematical Formulations

### 3.1. Income Drop Shock ($Shock_{income}$)
Parameters:
- $t_{start}$: Starting month of shock
- $d$: Duration in months
- $\alpha \in (0, 1]$: Magnitude fraction of reduction (e.g., $0.35$ for a $35\%$ salary cut)

$$I_t = \begin{cases} 
I_{net} \times (1 - \alpha) & \text{if } t_{start} \le t < t_{start} + d \\ 
I_{net} & \text{otherwise} 
\end{cases}$$

### 3.2. Lump-Sum Expense Shock ($Shock_{lump}$)
Parameters:
- $t_{event}$: Month event occurs
- $L$: One-time cost ($)

$$E_{extra, t} = \begin{cases} 
L & \text{if } t = t_{event} \\ 
0 & \text{otherwise} 
\end{cases}$$

### 3.3. Inflation Spike Shock ($Shock_{inflation}$)
Parameters:
- $t_{start}$: Start month
- $d$: Duration in months
- $\iota$: Annualized inflation bump (e.g., $0.08$)

$$E_{fixed, t} = E_{fixed} \times (1 + \frac{\iota}{12})^{(t - t_{start} + 1)}$$
$$E_{discretionary, t} = E_{discretionary} \times (1 + \frac{\iota}{12})^{(t - t_{start} + 1)}$$

### 3.4. Interest Rate Hike Shock ($Shock_{interest}$)
Parameters:
- $\Delta r$: Increase in variable annual interest rate (e.g., $+0.025$ for $+250\text{ bps}$)
- Applied to variable debt obligations:

$$D_{commitments, t} = D_{commitments} + \sum_{k \in Debts_{var}} (Balance_k \times \frac{\Delta r}{12})$$

---

## 4. Cascade Simulation Engine & Liquidity Propagation

When multiple shocks $\{Shock_1, Shock_2, \dots, Shock_n\}$ overlap or sequence across time:

For each month $t \in [1, T_{max}]$:

1. **Calculate Stressed Cash Flow:**
   $$FCF_t^{stressed} = I_t^{stressed} - (E_{fixed, t}^{stressed} + E_{discretionary, t}^{stressed} + D_{commitments, t}^{stressed} + E_{extra, t})$$

2. **Evaluate Liquidity & Emergency Buffer Absorption:**
   Let $B_t$ be the Emergency Buffer balance at month $t$, with initial buffer $B_0$:

   - If $FCF_t^{stressed} \ge C_{target}$:
     Goal contribution is met in full: $C_t = C_{target}$.  
     Surplus cashflow replenishes buffer up to cap: $B_t = B_{t-1} + (FCF_t^{stressed} - C_{target})$.
   
   - If $0 \le FCF_t^{stressed} < C_{target}$:
     Partial contribution from income: $C_t = FCF_t^{stressed}$.  
     Buffer remains unchanged: $B_t = B_{t-1}$.
   
   - If $FCF_t^{stressed} < 0$ (Deficit Month):
     Goal contribution is suspended: $C_t = 0$.  
     Deficit is drawn from emergency buffer:
     $$B_t = B_{t-1} + FCF_t^{stressed} \quad (\text{since } FCF_t^{stressed} < 0)$$
     
     **Insolvency Trigger:** If $B_t < 0$, an **Insolvency Event** occurs:
     $$\text{Deficit}_t = |B_t|$$
     $$B_t = 0$$

3. **Accumulate Goal Savings:**
   $$S_t^{stressed} = S_{t-1}^{stressed} + C_t$$

4. **Identify Stressed Completion Month ($t_{comp}^{stressed}$):**
   $$t_{comp}^{stressed} = \min \{ t \mid S_t^{stressed} \ge G_{target} \}$$

5. **Compute Target Slippage ($\Delta t$):**
   $$\Delta t = t_{comp}^{stressed} - t_{comp}^{base}$$

---

## 5. Resilience Score Formulation (0–100)

The **SaveSmart Resilience Score** ($R$) is a bounded metric quantifying systemic goal durability under stress.

$$R = 100 \times \left( w_1 \cdot \Phi_{buffer} + w_2 \cdot \Phi_{flex} + w_3 \cdot \Phi_{slip} + w_4 \cdot \Phi_{dti} \right)$$

Weights: $w_1 = 0.35, w_2 = 0.25, w_3 = 0.25, w_4 = 0.15$ ($\sum w_i = 1.0$).

### 5.1. Component $\Phi_{buffer}$ (Emergency Buffer Protection)
Evaluates minimum liquidity reached during the simulation against fixed monthly expenses:

$$\text{Coverage Months} = \frac{\min_{t} B_t}{E_{fixed}}$$

$$\Phi_{buffer} = \begin{cases}
1.0 & \text{if Coverage} \ge 3.0 \\
\frac{\text{Coverage}}{3.0} & \text{if } 0 \le \text{Coverage} < 3.0 \\
0.0 & \text{if Coverage} < 0 \text{ (Insolvency)}
\end{cases}$$

### 5.2. Component $\Phi_{flex}$ (Discretionary Budget Elasticity)
Evaluates what fraction of total spending can be voluntarily trimmed in an emergency:

$$\text{FlexRatio} = \frac{E_{discretionary}}{E_{fixed} + E_{discretionary}}$$

$$\Phi_{flex} = \min \left( 1.0, \frac{\text{FlexRatio}}{0.30} \right)$$

### 5.3. Component $\Phi_{slip}$ (Timeline Slippage Penalty)
Penalizes delays in reaching the savings target:

$$\Phi_{slip} = \max \left( 0.0, 1.0 - \frac{\Delta t}{T_{goal}} \right)$$

### 5.4. Component $\Phi_{dti}$ (Debt-to-Income Health)
$$DTI = \frac{D_{commitments}}{I_{net}}$$

$$\Phi_{dti} = \begin{cases}
1.0 & \text{if } DTI \le 0.15 \\
1.0 - \frac{DTI - 0.15}{0.35} & \text{if } 0.15 < DTI < 0.50 \\
0.0 & \text{if } DTI \ge 0.50
\end{cases}$$

### 5.5. Resilience Rating Tiers
- **Robust:** $80.0 \le R \le 100.0$ (Goal survives shocks with minimal slippage)
- **Moderate:** $60.0 \le R < 80.0$ (Goal delayed $< 6$ months, buffer preserved)
- **Vulnerable:** $40.0 \le R < 60.0$ (Buffer depleted or goal delayed $> 6$ months)
- **Critical:** $0.0 \le R < 40.0$ (Cash shortfall / insolvency triggered)

---

## 6. Adaptive Recovery Optimization Solver

The engine deterministically generates 3 distinct recovery solutions:

### Plan 1: Aggressive Action (Prioritize Original Deadline)
- **Goal:** Minimize $\Delta t$ toward $0$.
- **Mechanism:** Solves for discretionary expense cut $\beta \in [0.40, 0.75]$:
  $$\Delta E_{discretionary} = \beta \times E_{discretionary}$$
  Reallocates freed cash directly to the goal.

### Plan 2: Balanced Compromise (Recommended)
- **Goal:** Split impact evenly between mild lifestyle adjustment and modest delay.
- **Mechanism:** Fixed discretionary reduction $\beta = 0.25$, with timeline extension $\Delta t_{ext} \in [2, 6]$ months.

### Plan 3: Extended Timeline (Zero Lifestyle Disruption)
- **Goal:** Maintain exact pre-shock lifestyle ($0\%$ spending cuts).
- **Mechanism:** Accepts full organic slippage:
  $$T_{new} = t_{comp}^{stressed}$$

---

## 7. Gemini Explanation Guardrail Protocol

Before returning Gemini's narrative to the user, the backend executes the following check:

```python
def verify_gemini_narrative(narrative_text: str, engine_result: dict) -> bool:
    """
    Scans generated text for any dollar amount ($X,XXX) or numeric percentage (X%)
    and asserts that each mentioned value matches an exact ground-truth value 
    present in the engine_result payload.
    """
    # 1. Extract all currency mentions ($...)
    # 2. Extract all percentage mentions (...%)
    # 3. If any extracted metric does not appear in engine_result within a 1% tolerance,
    #    reject LLM output and serve deterministic template summary.
```
