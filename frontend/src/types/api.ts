/**
 * SaveSmart Shared API Response Types
 * Currency Standard: Indian Rupee (INR / ₹)
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
  target_amount: number; // In INR (₹)
  current_balance: number; // In INR (₹)
  target_months: number;
  priority: "low" | "medium" | "high";
  monthly_contribution?: number; // In INR (₹)
  created_at?: string;
}

export interface BaselineProfile {
  user_id: string;
  monthly_net_income: number; // In INR (₹)
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
    monthly_payment: number; // In INR (₹)
    remaining_balance: number; // In INR (₹)
    interest_rate_annual: number;
  }>;
  emergency_fund_balance: number; // In INR (₹)
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
  amount?: number; // In INR (₹)
  description?: string;
}

export interface SimulationResult {
  simulation_id: string;
  goal_id: string;
  currency: "INR";
  resilience_score: number;
  resilience_grade: ResilienceGrade;
  baseline: {
    completion_month: number;
    final_balance: number; // In INR (₹)
  };
  stressed: {
    completion_month: number;
    slippage_months: number;
    final_balance_at_original_deadline: number; // In INR (₹)
    capital_deficit: number; // In INR (₹)
    minimum_cash_buffer: number; // In INR (₹)
    buffer_exhausted: boolean;
  };
  monthly_timeline: Array<{
    month: number;
    baseline_balance: number; // In INR (₹)
    stressed_balance: number; // In INR (₹)
    stressed_cash_flow: number; // In INR (₹)
    is_shock_active: boolean;
  }>;
}

export interface RecoveryPlan {
  plan_id: "aggressive" | "balanced" | "extended";
  name: string;
  target_completion_month: number;
  slippage_months: number;
  discretionary_cut_percent: number;
  discretionary_savings_monthly: number; // In INR (₹)
  monthly_contribution_adjusted: number; // In INR (₹)
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
