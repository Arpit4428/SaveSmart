"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { Goal, RecoveryPlan, RecoveryPlansResponseData } from "@/types/api";
import { formatINR, formatPercent } from "@/lib/utils";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { RecoveryChart } from "@/components/charts/RecoveryChart";
import { AssumptionLedger } from "@/components/ui/AssumptionLedger";
import { AIExplanationCard } from "@/components/ui/AIExplanationCard";
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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200/80 text-[10px] font-mono font-medium text-stone-600 mb-3">
            <span>STEP 5 OF 5</span>
            <span className="text-stone-300">•</span>
            <span>ADAPTIVE RESOLUTION</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-stone-950 tracking-tight">
            Adaptive Recovery Planner & Trade-Off Simulator
          </h1>
          <p className="text-base sm:text-lg text-stone-600 mt-2 max-w-3xl font-serif italic">
            Compare 3 deterministic pathways solved by Python optimization to restore your goal after disruption.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-sm flex items-center gap-2.5 shadow-soft-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Goal Selector */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-[10px] font-mono font-semibold text-stone-500 tracking-wider uppercase whitespace-nowrap">
              OPTIMIZE GOAL:
            </label>
            <select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              className="text-xs font-medium px-3.5 py-2 border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 w-72 transition-all"
            >
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({formatINR(g.target_amount)})
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs font-mono text-stone-500">
            3 Deterministic Solutions Solved via Pure Python Engine
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="py-24 flex flex-col justify-center items-center text-sm text-stone-500">
          <RefreshCw className="w-5 h-5 animate-spin mb-2 text-stone-400" />
          <span>Solving recovery trade-offs & deterministic trajectories...</span>
        </div>
      ) : plans.length === 0 ? (
        <div className="py-16 text-center text-sm text-stone-500 border-2 border-dashed border-stone-200 rounded-2xl p-8 bg-stone-50/50">
          <p className="font-medium text-stone-700 font-display">No recovery plans available for this goal</p>
          <p className="text-xs text-stone-400 mt-1">Please ensure a baseline profile and goal have been established.</p>
        </div>
      ) : (
        <>
          {/* Visual Strategy Trajectory Comparator */}
          <Card className="p-6 sm:p-7">
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

          {/* Side-by-Side 3 Recovery Plan Cards: Visually Distinctive Profiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isSelected = plan.plan_id === selectedPlanId;

              // Visually distinctive personality styles for each pathway
              const profileStyle =
                plan.plan_id === "aggressive"
                  ? {
                      tag: "High Pressure",
                      tagClass: "text-amber-800 bg-amber-50 border-amber-200/80",
                      activeBorder: "border-amber-700 ring-1 ring-amber-700 bg-amber-50/20",
                      accentNum: "text-amber-700",
                    }
                  : plan.plan_id === "extended"
                  ? {
                      tag: "Low Pressure",
                      tagClass: "text-stone-700 bg-stone-100 border-stone-200",
                      activeBorder: "border-stone-800 ring-1 ring-stone-800 bg-stone-50/30",
                      accentNum: "text-stone-700",
                    }
                  : {
                      tag: "Moderate Pressure",
                      tagClass: "text-emerald-800 bg-emerald-50 border-emerald-200/80",
                      activeBorder: "border-emerald-700 ring-1 ring-emerald-700 bg-emerald-50/20",
                      accentNum: "text-emerald-700",
                    };

              return (
                <div
                  key={plan.plan_id}
                  onClick={() => setSelectedPlanId(plan.plan_id)}
                  className={`cursor-pointer rounded-2xl border p-6 sm:p-7 transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? `${profileStyle.activeBorder} shadow-soft-md`
                      : "border-stone-200/80 bg-white hover:border-stone-300 shadow-soft-sm"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${profileStyle.tagClass}`}>
                            {profileStyle.tag}
                          </span>
                        </div>
                        <h3 className="font-display font-bold text-stone-950 text-lg tracking-tight">{plan.name}</h3>
                        <p className="text-xs font-mono text-stone-500 mt-0.5">
                          Finishes Month {plan.target_completion_month} (+{plan.slippage_months} mos)
                        </p>
                      </div>
                      <Badge variant={plan.feasibility_score >= 80 ? "success" : "default"}>
                        {plan.feasibility_score}% Feasible
                      </Badge>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed pt-1">
                      {plan.description}
                    </p>

                    <div className="space-y-2.5 pt-4 border-t border-stone-100 text-xs">
                      <div className="flex justify-between">
                        <span className="text-stone-500">Flexible Spending Cut:</span>
                        <span className="font-semibold text-stone-900 tabular-nums font-mono">
                          {formatPercent(plan.discretionary_cut_percent * 100)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Monthly Budget Freed:</span>
                        <span className={`font-semibold tabular-nums font-mono ${profileStyle.accentNum}`}>
                          {formatINR(plan.discretionary_savings_monthly)}/mo
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Adjusted Monthly Savings:</span>
                        <span className="font-bold text-stone-950 tabular-nums font-mono">
                          {formatINR(plan.monthly_contribution_adjusted)}/mo
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Buffer Preserved:</span>
                        <span className="font-semibold text-stone-900 tabular-nums font-mono">
                          {formatINR(plan.buffer_preserved || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Time to Full Recovery:</span>
                        <span className="font-medium text-stone-800 tabular-nums font-mono">
                          {plan.time_to_recover_months ? `${plan.time_to_recover_months} Mos` : "On Deadline"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-100">
                    <button
                      type="button"
                      className={`w-full py-2.5 px-4 text-xs font-medium rounded-full transition-all ${
                        isSelected
                          ? "bg-stone-950 text-white shadow-soft-sm font-semibold"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200/80"
                      }`}
                    >
                      {isSelected ? "Active Strategy" : "Inspect Strategy"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Explanation Layer */}
          <AIExplanationCard
            goalId={selectedGoalId}
            explanationType="recovery"
            title="AI Recovery Strategy Advisor: Trade-Off Analysis"
          />

          {/* Detailed Strategy Breakdown & Trade-Off Matrix ("What It Costs You") */}
          {activePlan && (
            <div className="p-6 sm:p-7 rounded-2xl border border-stone-200/80 bg-white shadow-soft-sm space-y-6">
              <div className="pb-4 border-b border-stone-200/80">
                <h3 className="font-display font-bold text-stone-950 text-base tracking-tight">
                  Strategy Deep-Dive: {activePlan.name}
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Transparent trade-offs, lifestyle impacts, and capital recovery metrics
                </p>
              </div>

              {/* 3 Core Metric Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <div className="text-stone-500 font-mono font-semibold text-[10px] uppercase tracking-wider">
                    Timeline Shift
                  </div>
                  <div className="text-2xl sm:text-3xl font-display font-bold text-stone-950 tabular-nums">
                    +{activePlan.slippage_months} <span className="text-xs font-normal text-stone-500">Months</span>
                  </div>
                  <p className="text-stone-500 text-[11px] pt-1.5 border-t border-stone-200/60 font-mono">
                    New target milestone: Month {activePlan.target_completion_month}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <div className="text-stone-500 font-mono font-semibold text-[10px] uppercase tracking-wider">
                    Monthly Discretionary Cut
                  </div>
                  <div className="text-2xl sm:text-3xl font-display font-bold text-emerald-700 tabular-nums">
                    Save {formatINR(activePlan.discretionary_savings_monthly)}<span className="text-xs font-normal text-stone-500">/mo</span>
                  </div>
                  <p className="text-stone-500 text-[11px] pt-1.5 border-t border-stone-200/60 font-mono">
                    Trim flexible spending by {formatPercent(activePlan.discretionary_cut_percent * 100)}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <div className="text-stone-500 font-mono font-semibold text-[10px] uppercase tracking-wider">
                    Liquid Buffer Preserved
                  </div>
                  <div className="text-2xl sm:text-3xl font-display font-bold text-stone-950 tabular-nums">
                    {formatINR(activePlan.buffer_preserved || 0)}
                  </div>
                  <p className="text-stone-500 text-[11px] pt-1.5 border-t border-stone-200/60 font-mono">
                    Replenished by Month {activePlan.emergency_buffer_replenished_month}
                  </p>
                </div>
              </div>

              {/* Trade-Off Matrix: What It Costs You */}
              <div className="rounded-2xl border border-stone-200/80 bg-stone-50/70 p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-stone-700" />
                  <h4 className="font-mono font-semibold text-stone-950 text-[11px] uppercase tracking-wider">
                    Trade-Off Analysis: What This Strategy Costs You
                  </h4>
                </div>

                {activePlan.trade_offs && (
                  <p className="text-xs text-stone-700 bg-white p-4 rounded-xl border border-stone-200/80 leading-relaxed shadow-soft-sm font-serif italic text-sm">
                    {activePlan.trade_offs}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
                  {/* Advantages (Pros) */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200/80 space-y-3 shadow-soft-sm">
                    <div className="font-mono font-bold text-emerald-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Key Advantages (Pros)
                    </div>
                    {activePlan.pros && activePlan.pros.length > 0 ? (
                      <ul className="space-y-2 text-stone-600">
                        {activePlan.pros.map((pro, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span className="leading-relaxed">{pro}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-stone-400 text-[11px]">No specific pros listed.</p>
                    )}
                  </div>

                  {/* Sacrifices (Cons) */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200/80 space-y-3 shadow-soft-sm">
                    <div className="font-mono font-bold text-rose-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      Lifestyle & Timeline Costs (Cons)
                    </div>
                    {activePlan.cons && activePlan.cons.length > 0 ? (
                      <ul className="space-y-2 text-stone-600">
                        {activePlan.cons.map((con, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-rose-500 font-bold">•</span>
                            <span className="leading-relaxed">{con}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-stone-400 text-[11px]">No specific cons listed.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Next Step Transition CTA to Survival Map */}
          <div className="p-6 sm:p-7 rounded-2xl bg-stone-950 text-white shadow-soft-md flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-400">
                Integrated Visualization
              </div>
              <h4 className="font-display font-bold text-base text-white mt-1">
                Validate Recovered Curve on Goal Survival Map
              </h4>
              <p className="text-xs text-stone-400 mt-1 max-w-xl leading-relaxed">
                Observe how your selected recovery plan repairs your liquid buffer runway and overcomes capital shortfalls.
              </p>
            </div>
            <Link
              href="/survival"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-stone-950 bg-white hover:bg-stone-100 rounded-full transition-colors shadow-soft-sm shrink-0"
            >
              View on Goal Survival Map <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Assumption Ledger */}
          {recoveryData?.assumption_ledger && (
            <AssumptionLedger ledger={recoveryData.assumption_ledger} />
          )}
        </>
      )}
    </div>
  );
}
