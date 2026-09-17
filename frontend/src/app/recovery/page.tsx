"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Goal, RecoveryPlan } from "@/types/api";
import { formatINR, formatPercent } from "@/lib/utils";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  RefreshCw,
  CheckCircle2,
  Calendar,
  Sliders,
  ArrowRight,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export default function RecoveryPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [plans, setPlans] = useState<RecoveryPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("balanced");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getGoals()
      .then((data) => {
        setGoals(data);
        if (data.length > 0) setSelectedGoalId(data[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedGoalId) return;

    setLoading(true);
    setError(null);
    api.getRecoveryPlans(selectedGoalId, [
      {
        shock_type: "income_drop",
        start_month: 2,
        duration_months: 3,
        magnitude_percent: 0.35,
      },
    ])
      .then((res) => {
        setPlans(res.plans);
      })
      .catch((err: any) => {
        setError(err.message || "Failed to solve recovery plans.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedGoalId]);

  const activePlan = plans.find((p) => p.plan_id === selectedPlanId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Adaptive Recovery Planner</h1>
        <p className="text-sm text-slate-500 mt-1">
          Mathematically optimized recovery pathways to absorb shock impact and get your goal back on track.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Goal Selector */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-700">OPTIMIZE GOAL:</label>
            <select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              className="text-xs font-medium px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-emerald-500 w-64"
            >
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({formatINR(g.target_amount)})
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500">
            3 Deterministic Solutions Solved via Python Optimization
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="py-20 flex justify-center items-center text-sm text-slate-500">
          <RefreshCw className="w-4 h-4 animate-spin mr-2 text-emerald-600" /> Solving recovery trade-offs...
        </div>
      ) : plans.length === 0 ? (
        <Card className="py-12 text-center text-sm text-slate-500">
          No recovery plans available for this goal.
        </Card>
      ) : (
        <>
          {/* Side-by-Side 3 Recovery Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isSelected = plan.plan_id === selectedPlanId;
              const isRecommended = plan.plan_id === "balanced";

              return (
                <div
                  key={plan.plan_id}
                  onClick={() => setSelectedPlanId(plan.plan_id)}
                  className={`cursor-pointer rounded-xl border p-5 transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? "border-emerald-600 bg-white ring-2 ring-emerald-600/20 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  {isRecommended && (
                    <span className="absolute -top-3 left-4 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                      Recommended
                    </span>
                  )}

                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{plan.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Finishes at Month {plan.target_completion_month} (+{plan.slippage_months} mos)
                        </p>
                      </div>
                      <Badge variant={plan.feasibility_score > 90 ? "success" : "info"}>
                        {plan.feasibility_score}% Feasible
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      {plan.description}
                    </p>

                    <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Flexible Spending Cut:</span>
                        <span className="font-semibold text-slate-900">
                          {formatPercent(plan.discretionary_cut_percent * 100)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Monthly Budget Freed:</span>
                        <span className="font-semibold text-emerald-600">
                          {formatINR(plan.discretionary_savings_monthly)}/mo
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Adjusted Monthly Savings:</span>
                        <span className="font-bold text-slate-900">
                          {formatINR(plan.monthly_contribution_adjusted)}/mo
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Buffer Replenished:</span>
                        <span className="font-medium text-slate-700">
                          Month {plan.emergency_buffer_replenished_month}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      className={`w-full py-2 px-3 text-xs font-medium rounded-lg transition-colors ${
                        isSelected
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {isSelected ? "Selected Strategy" : "Select Strategy"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Strategy Breakdown */}
          {activePlan && (
            <Card className="p-6 border-slate-200">
              <CardHeader
                title={`Strategy Implementation: ${activePlan.name}`}
                subtitle="Deterministic timeline adjustment and contribution guidance"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-slate-500 font-medium">Timeline Shift</div>
                  <div className="text-lg font-bold text-slate-900">
                    +{activePlan.slippage_months} Months
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    New target completion milestone: Month {activePlan.target_completion_month}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-slate-500 font-medium">Required Monthly Discipline</div>
                  <div className="text-lg font-bold text-emerald-600">
                    Save {formatINR(activePlan.discretionary_savings_monthly)}/mo
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Trim discretionary luxuries by {formatPercent(activePlan.discretionary_cut_percent * 100)}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-slate-500 font-medium">Liquid Buffer Protection</div>
                  <div className="text-lg font-bold text-blue-600">
                    Month {activePlan.emergency_buffer_replenished_month}
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Emergency cushion fully restored to baseline safety levels
                  </p>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
