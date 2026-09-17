/**
 * SaveSmart Shared API Response Types
 * Mirrors backend Pydantic API schemas
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export type ResilienceGrade = "ROBUST" | "MODERATE" | "VULNERABLE" | "CRITICAL";

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  category: "housing" | "emergency" | "vehicle" | "education" | "investment" | "lifestyle";
  target_amount: number;
  current_balance: number;
  target_months: number;
  priority: "low" | "medium" | "high";
  monthly_contribution?: number;
  created_at?: string;
}

export interface BaselineProfile {
  user_id: string;
  monthly_net_income: number;
  fixed_expenses: {
    rent_or_mortgage: number;
    utilities: number;
    insurance: number;
    subscriptions_and_bills: number;
    [key: string]: number;
  };
  discretionary_expenses: {
    dining_out: number;
    entertainment: number;
    shopping: number;
    other: number;
    [key: string]: number;
  };
  debt_commitments: Array<{
    name: string;
    monthly_payment: number;
    remaining_balance: number;
    interest_rate_annual: number;
  }>;
  emergency_fund_balance: number;
  summary?: {
    total_fixed_expenses: number;
    total_discretionary_expenses: number;
    total_debt_payments: number;
    net_free_cash_flow: number;
    savings_capacity_percent: number;
  };
}

export type ShockType = "income_drop" | "lump_sum_expense" | "inflation_spike" | "interest_rate_hike";

export interface ShockEvent {
  shock_type: ShockType;
  start_month: number;
  duration_months?: number;
  magnitude_percent?: number;
  amount?: number;
  description?: string;
}

export interface SimulationResult {
  simulation_id: string;
  goal_id: string;
  resilience_score: number;
  resilience_grade: ResilienceGrade;
  baseline: {
    completion_month: number;
    final_balance: number;
  };
  stressed: {
    completion_month: number;
    slippage_months: number;
    final_balance_at_original_deadline: number;
    capital_deficit: number;
    minimum_cash_buffer: number;
    buffer_exhausted: boolean;
  };
  monthly_timeline: Array<{
    month: number;
    baseline_balance: number;
    stressed_balance: number;
    stressed_cash_flow: number;
    is_shock_active: boolean;
  }>;
}

export interface RecoveryPlan {
  plan_id: "aggressive" | "balanced" | "extended";
  name: string;
  target_completion_month: number;
  slippage_months: number;
  discretionary_cut_percent: number;
  discretionary_savings_monthly: number;
  monthly_contribution_adjusted: number;
  emergency_buffer_replenished_month: number;
  feasibility_score: number;
  description: string;
}

export interface GeminiNarrative {
  simulation_id: string;
  executive_summary: string;
  key_findings: string[];
  actionable_coaching: string;
}
