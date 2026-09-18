"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Goal, RecoveryPlan, RecoveryPlansResponseData } from "@/types/api";
import { formatINR, formatPercent } from "@/lib/utils";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { RecoveryChart } from "@/components/charts/RecoveryChart";
import { AssumptionLedger } from "@/components/ui/AssumptionLedger";
import {
  RefreshCw,
  CheckCircle2,
  Calendar,
  Sliders,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  Scale,
  XCircle,
  Clock,
  Coins,
} from "lucide-react";

export default function RecoveryPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [recoveryData, setRecoveryData] = useState<RecoveryPlansResponseData | null>(null);
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
        description: "Simulated 35% Income Disruption",
      },
    ])
      .then((res) => {
        setRecoveryData(res);
        if (res.plans.length > 0) {
          const hasBalanced = res.plans.some((p) => p.plan_id === "balanced");
          setSelectedPlanId(hasBalanced ? "balanced" : res.plans[0].plan_id);
        }
      })
      .catch((err: any) => {
        setError(err.message || "Failed to solve recovery plans.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedGoalId]);

  const plans = recoveryData?.plans || [];
  const activePlan = plans.find((p) => p.plan_id === selectedPlanId);
  const selectedGoal = goals.find((g) => g.id === selectedGoalId);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs uppercase tracking-wider">
          <Scale className="w-4 h-4" /> Adaptive Decision Engine
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
          Adaptive Recovery Planner & Trade-Off Simulator
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Compare 3 deterministic pathways solved by Python optimization to restore your goal after disruption.
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

          <div className="text-xs text-slate-500 font-medium">
            3 Deterministic Solutions Solved via Pure Python Engine
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="py-20 flex justify-center items-center text-sm text-slate-500">
          <RefreshCw className="w-4 h-4 animate-spin mr-2 text-emerald-600" /> Solving recovery trade-offs & trajectories...
        </div>
      ) : plans.length === 0 ? (
        <Card className="py-12 text-center text-sm text-slate-500">
          No recovery plans available for this goal.
        </Card>
      ) : (
        <>
          {/* Visual Strategy Trajectory Comparator */}
          <Card>
            <CardHeader
              title="Recovery Trajectory Comparator: 3 Deterministic Pathways"
              subtitle="Comparison of Aggressive vs. Balanced vs. Extended recovery curves against the unmitigated Stressed path"
            />
            <RecoveryChart
              aggressiveCurve={recoveryData?.curves?.aggressive || plans.find(p => p.plan_id === "aggressive")?.trajectory_curve}
              balancedCurve={recoveryData?.curves?.balanced || plans.find(p => p.plan_id === "balanced")?.trajectory_curve}
              extendedCurve={recoveryData?.curves?.extended || plans.find(p => p.plan_id === "extended")?.trajectory_curve}
              stressedCurve={recoveryData?.curves?.stressed}
              targetAmount={recoveryData?.target_amount || selectedGoal?.target_amount}
              targetDeadlineMonths={recoveryData?.target_deadline_months || selectedGoal?.target_months}
            />
          </Card>

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
                      <Badge variant={plan.feasibility_score >= 80 ? "success" : "info"}>
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
                        <span className="text-slate-500">Buffer Preserved:</span>
                        <span className="font-mono font-bold text-blue-700">
                          {formatINR(plan.buffer_preserved || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Time to Full Recovery:</span>
                        <span className="font-semibold text-slate-800">
                          {plan.time_to_recover_months ? `${plan.time_to_recover_months} Mos` : "On Deadline"}
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
                      {isSelected ? "Active Strategy" : "Inspect Strategy"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Strategy Breakdown & Trade-Off Matrix ("What It Costs You") */}
          {activePlan && (
            <Card className="p-6 border-slate-200 space-y-6">
              <CardHeader
                title={`Strategy Deep-Dive: ${activePlan.name}`}
                subtitle="Transparent trade-offs, lifestyle impacts, and capital recovery metrics"
              />

              {/* 3 Core Metric Tiles */}
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
                  <div className="text-slate-500 font-medium">Monthly Discretionary Cut</div>
                  <div className="text-lg font-bold text-emerald-600">
                    Save {formatINR(activePlan.discretionary_savings_monthly)}/mo
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Trim discretionary spending by {formatPercent(activePlan.discretionary_cut_percent * 100)}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-slate-500 font-medium">Liquid Buffer Preserved</div>
                  <div className="text-lg font-bold text-blue-600">
                    {formatINR(activePlan.buffer_preserved || 0)}
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Replenished by Month {activePlan.emergency_buffer_replenished_month}
                  </p>
                </div>
              </div>

              {/* Trade-Off Matrix: What It Costs You */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-600" />
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Trade-Off Analysis: What This Strategy Costs You
                  </h4>
                </div>

                {activePlan.trade_offs && (
                  <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                    {activePlan.trade_offs}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
                  {/* Advantages (Pros) */}
                  <div className="bg-white p-3 rounded-lg border border-emerald-200 space-y-2">
                    <div className="font-bold text-emerald-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Key Advantages (Pros)
                    </div>
                    {activePlan.pros && activePlan.pros.length > 0 ? (
                      <ul className="space-y-1.5 text-slate-600">
                        {activePlan.pros.map((pro, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-400 text-[11px]">No specific pros listed.</p>
                    )}
                  </div>

                  {/* Sacrifices (Cons) */}
                  <div className="bg-white p-3 rounded-lg border border-rose-200 space-y-2">
                    <div className="font-bold text-rose-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      Lifestyle & Timeline Costs (Cons)
                    </div>
                    {activePlan.cons && activePlan.cons.length > 0 ? (
                      <ul className="space-y-1.5 text-slate-600">
                        {activePlan.cons.map((con, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-rose-500 font-bold">•</span>
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-400 text-[11px]">No specific cons listed.</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Assumption Ledger */}
          {recoveryData?.assumption_ledger && (
            <AssumptionLedger ledger={recoveryData.assumption_ledger} />
          )}
        </>
      )}
    </div>
  );
}
