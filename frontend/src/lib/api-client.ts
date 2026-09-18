import {
  ApiResponse,
  BaselineProfile,
  Goal,
  GoalCreateInput,
  GoalHealthReport,
  RecoveryPlan,
  RecoveryPlansResponseData,
  ScenarioExplanationRequest,
  ScenarioExplanationResponse,
  ShockEvent,
  SimulationResult,
  SurvivalMapData,
  SystemHealth,
} from "@/types/api";

function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!envUrl) return "http://localhost:8000/api/v1";
  const clean = envUrl.replace(/\/+$/, "");
  return clean.endsWith("/api/v1") ? clean : `${clean}/api/v1`;
}

const API_BASE_URL = getApiBaseUrl();

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.error?.message) {
        errorMsg = errJson.error.message;
      }
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  const json: ApiResponse<T> = await res.json();
  if (!json.success && json.error) {
    throw new Error(json.error.message || "API request failed");
  }

  return (json.data ?? (json as unknown as T)) as T;
}

export const api = {
  // System Health
  async getHealth(): Promise<SystemHealth> {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error("Health check failed");
    return res.json();
  },

  // Goals
  async getGoals(userId: string = "demo_user"): Promise<Goal[]> {
    return request<Goal[]>(`/goals?user_id=${encodeURIComponent(userId)}`);
  },

  async getGoal(goalId: string): Promise<Goal> {
    return request<Goal>(`/goals/${encodeURIComponent(goalId)}`);
  },

  async createGoal(goal: GoalCreateInput): Promise<Goal> {
    return request<Goal>("/goals", {
      method: "POST",
      body: JSON.stringify(goal),
    });
  },

  async deleteGoal(goalId: string): Promise<{ id: string; deleted: boolean }> {
    return request<{ id: string; deleted: boolean }>(`/goals/${encodeURIComponent(goalId)}`, {
      method: "DELETE",
    });
  },

  async getGoalHealth(goalId: string): Promise<GoalHealthReport> {
    return request<GoalHealthReport>(`/goals/${encodeURIComponent(goalId)}/health`);
  },

  // Financial Baseline
  async getBaseline(userId: string = "demo_user"): Promise<BaselineProfile> {
    return request<BaselineProfile>(`/baseline?user_id=${encodeURIComponent(userId)}`);
  },

  async saveBaseline(baseline: BaselineProfile): Promise<BaselineProfile> {
    return request<BaselineProfile>("/baseline", {
      method: "POST",
      body: JSON.stringify(baseline),
    });
  },

  // Stress Testing
  async simulateSingleShock(
    goalId: string,
    shock: ShockEvent,
    horizonMonths: number = 36
  ): Promise<SimulationResult> {
    return request<SimulationResult>("/stress-test/simulate", {
      method: "POST",
      body: JSON.stringify({
        goal_id: goalId,
        shock,
        horizon_months: horizonMonths,
      }),
    });
  },

  async simulateCascade(
    goalId: string,
    sequenceName: string,
    shocks: ShockEvent[],
    horizonMonths: number = 36
  ): Promise<SimulationResult> {
    return request<SimulationResult>("/stress-test/cascade", {
      method: "POST",
      body: JSON.stringify({
        goal_id: goalId,
        sequence_name: sequenceName,
        shocks,
        horizon_months: horizonMonths,
      }),
    });
  },

  // Recovery Plans
  async getRecoveryPlans(
    goalId: string,
    shocks: ShockEvent[] = []
  ): Promise<RecoveryPlansResponseData> {
    return request<RecoveryPlansResponseData>("/recovery/plans", {
      method: "POST",
      body: JSON.stringify({
        goal_id: goalId,
        shocks,
      }),
    });
  },

  // Survival Map
  async getSurvivalMap(
    goalId: string,
    shocks: ShockEvent[] = [],
    horizonMonths: number = 36
  ): Promise<SurvivalMapData> {
    return request<SurvivalMapData>("/survival/map", {
      method: "POST",
      body: JSON.stringify({
        goal_id: goalId,
        shocks,
        horizon_months: horizonMonths,
      }),
    });
  },

  // Gemini AI Explainer
  async explainScenario(
    req: ScenarioExplanationRequest
  ): Promise<ScenarioExplanationResponse> {
    return request<ScenarioExplanationResponse>("/explain/scenario", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },
};
