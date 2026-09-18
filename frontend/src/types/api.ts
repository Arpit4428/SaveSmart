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

export interface GoalCreateInput {
  user_id?: string;
  name: string;
  category: string;
  target_amount: number;
  current_balance: number;
  target_months: number;
  priority: string;
}

export interface HealthRiskFactor {
  factor: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  description: string;
}

export interface ResilienceFingerprint {
  buffer_strength: number; // 0-100
  cashflow_flexibility: number; // 0-100
  debt_pressure_safety: number; // 0-100
  goal_capacity_cushion: number; // 0-100
  shock_recovery_velocity: number; // 0-100
  overall_score: number;
  overall_grade: string;
}

export interface ChainReactionStep {
  step_number: number;
  title: string;
  timing: string;
  shock_type: string;
  monthly_cashflow_impact: number;
  remaining_buffer: number;
  monthly_contribution_change: number;
  goal_impact_description: string;
  cumulative_delay_added: number;
  is_critical?: boolean;
}

export interface FailureDiagnostic {
  headline: string;
  root_causes: string[];
  primary_vulnerability: string;
  contribution_drop_monthly: number;
  cashflow_drop_monthly: number;
  buffer_absorbed_total: number;
  deadline_slippage_months: number;
  capital_loss_at_deadline: number;
}

export interface AssumptionLedger {
  monthly_net_income: number;
  total_fixed_expenses: number;
  total_discretionary_expenses: number;
  total_debt_payments: number;
  emergency_fund_balance: number;
  goal_name: string;
  goal_target_amount: number;
  goal_initial_balance: number;
  goal_target_months: number;
  base_monthly_contribution: number;
  shocks_count: number;
  shocks_applied: Array<{
    shock_type: string;
    start_month: number;
    duration_months: number;
    magnitude_percent?: number;
    amount?: number;
    description?: string;
  }>;
  simulation_horizon_months: number;
}

export interface GoalHealthReport {
  goal_id: string;
  currency: "INR";
  health_status: "HEALTHY" | "MODERATE_RISK" | "AT_RISK";
  baseline_resilience_score: number;
  monthly_savings_rate: number;
  free_cash_flow_margin: number;
  emergency_buffer_months: number;
  debt_to_income_ratio: number;
  risk_factors: HealthRiskFactor[];
  resilience_fingerprint?: ResilienceFingerprint;
  assumption_ledger?: AssumptionLedger;
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
    is_variable_rate?: boolean;
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
  cascade_triggered_insolvency?: boolean;
  insolvency_first_month?: number | null;
  peak_deficit?: number;
  baseline: {
    completion_month: number | null;
    final_balance: number; // In INR (₹)
  };
  stressed: {
    completion_month: number | null;
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
    is_insolvent?: boolean;
    emergency_buffer_balance?: number;
  }>;
  chain_reaction_steps?: ChainReactionStep[];
  failure_diagnostic?: FailureDiagnostic;
  assumption_ledger?: AssumptionLedger;
  resilience_fingerprint?: ResilienceFingerprint;
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
  buffer_preserved?: number;
  time_to_recover_months?: number;
  pros?: string[];
  cons?: string[];
  trade_offs?: string;
  trajectory_curve?: number[];
}

export interface RecoveryPlansResponseData {
  goal_id: string;
  simulation_id: string;
  currency: "INR";
  plans: RecoveryPlan[];
  curves?: {
    aggressive?: number[];
    balanced?: number[];
    extended?: number[];
    stressed?: number[];
    [key: string]: number[] | undefined;
  };
  target_amount?: number;
  target_deadline_months?: number;
  assumption_ledger?: AssumptionLedger;
}

export interface SurvivalMapData {
  goal_id: string;
  currency: "INR";
  total_months: number;
  insolvency_threshold: number;
  safe_buffer_threshold: number;
  curves: {
    baseline: number[];
    stressed: number[];
    recovered_balanced: number[];
  };
  target_amount?: number;
  target_deadline_months?: number;
  first_unsafe_month?: number | null;
  max_drawdown?: number;
  deadline_slippage?: number;
  capital_shortfall?: number;
  recovery_point_month?: number | null;
  final_status?: "SURVIVED" | "DELAYED" | "CRITICAL";
  survival_verdict?: string;
  buffer_curves?: {
    baseline: number[];
    stressed: number[];
    recovered_balanced: number[];
  };
  assumption_ledger?: AssumptionLedger;
}

export interface SystemHealth {
  status: string;
  version: string;
  currency: string;
  mongodb_connected: boolean;
  gemini_api_configured: boolean;
}

export interface ScenarioExplanationRequest {
  goal_id: string;
  explanation_type: "health" | "stress_test" | "cascade" | "recovery" | "survival";
  shocks?: ShockEvent[];
  horizon_months?: number;
  question?: string;
}

export interface AIExplanationStructured {
  headline: string;
  summary: string;
  key_drivers: string[];
  impact_assessment: string;
  trade_offs_explained?: string | null;
  actionable_next_steps: string[];
}

export interface ScenarioExplanationResponse {
  goal_id: string;
  explanation_type: string;
  currency: "INR";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  verified_financial_result: Record<string, any>;
  ai_explanation: AIExplanationStructured;
  is_fallback: boolean;
  model_used?: string | null;
  disclaimer: string;
}


