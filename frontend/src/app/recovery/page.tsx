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
  ArrowRight,
  AlertCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Coins,
  Layers,
} from "lucide-react";

export default function RecoveryPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [recoveryData, setRecoveryData] = useState<RecoveryPlansResponseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("balanced");
  const [error, setError] = useState<string | null>(null);

  // Progressive disclosure for deep trade-offs & ledger
  const [showTradeOffDetails, setShowTradeOffDetails] = useState(true);
  const [showLedger, setShowLedger] = useState(false);

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
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-200/50 border border-stone-300/60 text-[10px] font-display font-medium text-stone-700 tracking-wider uppercase mb-2">
            <span>Adaptive Resolution</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-stone-950 tracking-tight">
            Adaptive Recovery Planner
          </h1>
          <p className="text-base sm:text-lg text-stone-600 font-serif italic mt-1">
            Compare 3 deterministic pathways solved by Python optimization to restore goal solvency.
          </p>
        </div>

        {/* Goal Selector */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-display font-bold uppercase text-stone-400">Optimize Goal:</label>
          <select
            value={selectedGoalId}
            onChange={(e) => setSelectedGoalId(e.target.value)}
            className="text-xs font-display font-semibold px-3.5 py-2 border border-stone-300/80 rounded-full bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 shadow-soft-sm"
          >
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} ({formatINR(g.target_amount)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-24 flex flex-col justify-center items-center text-xs text-stone-500 space-y-2">
          <RefreshCw className="w-5 h-5 animate-spin text-stone-800" />
          <span className="font-display font-medium">Solving recovery trade-offs & deterministic trajectories...</span>
        </div>
      ) : plans.length === 0 ? (
        <div className="py-16 text-center text-xs text-stone-500 border border-dashed border-stone-200 rounded-3xl p-8 bg-stone-50/50">
          <p className="font-display font-semibold text-stone-700">No recovery plans available for this goal</p>
          <p className="text-stone-400 mt-1">Please ensure a baseline profile and goal have been established.</p>
        </div>
      ) : (
        <>
          {/* 1. PRIMARY RESULT: 3 Distinct Recovery Strategy Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isSelected = plan.plan_id === selectedPlanId;

              const profileStyle =
                plan.plan_id === "aggressive"
                  ? {
                      tag: "High Savings Cut",
                      tagClass: "text-amber-900 bg-amber-50 border-amber-200",
                      activeBorder: "border-amber-800 ring-1 ring-amber-800 bg-amber-50/15",
                      accentNum: "text-amber-800",
                    }
                  : plan.plan_id === "extended"
                  ? {
                      tag: "Timeline Shift",
                      tagClass: "text-stone-800 bg-stone-100 border-stone-200",
                      activeBorder: "border-stone-900 ring-1 ring-stone-900 bg-stone-50/30",
                      accentNum: "text-stone-800",
                    }
                  : {
                      tag: "Balanced Plan",
                      tagClass: "text-emerald-900 bg-emerald-50 border-emerald-200",
                      activeBorder: "border-emerald-800 ring-1 ring-emerald-800 bg-emerald-50/15",
                      accentNum: "text-emerald-800",
                    };

              return (
                <div
                  key={plan.plan_id}
                  onClick={() => setSelectedPlanId(plan.plan_id)}
                  className={`cursor-pointer rounded-3xl border p-6 sm:p-7 transition-all flex flex-col justify-between ${
                    isSelected
                      ? `${profileStyle.activeBorder} shadow-soft-md`
                      : "border-stone-200/80 bg-white hover:border-stone-300 shadow-soft-sm"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-[10px] font-display font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${profileStyle.tagClass}`}>
                          {profileStyle.tag}
                        </span>
                        <h3 className="font-display font-bold text-stone-950 text-xl tracking-tight mt-2">
                          {plan.name}
                        </h3>
                      </div>
                      <Badge variant={plan.feasibility_score >= 80 ? "success" : "default"}>
                        {plan.feasibility_score}% Feasible
                      </Badge>
                    </div>

                    <p className="text-xs text-stone-500 leading-relaxed font-sans">
                      {plan.description}
                    </p>

                    {/* 3 Core Numbers with Big Typography */}
                    <div className="pt-3 border-t border-stone-100 space-y-3">
                      <div>
                        <div className="text-[10px] font-display font-bold uppercase tracking-wider text-stone-400">
                          Adjusted Monthly Savings
                        </div>
                        <div className={`text-2xl sm:text-3xl font-display font-bold tabular-nums ${profileStyle.accentNum}`}>
                          {formatINR(plan.monthly_contribution_adjusted)}<span className="text-xs font-normal text-stone-400">/mo</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                        <div>
                          <div className="text-[10px] font-display font-bold uppercase text-stone-400">Deadline Shift</div>
                          <div className="font-display font-bold text-stone-950 mt-0.5">
                            +{plan.slippage_months} Mos (M{plan.target_completion_month})
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-display font-bold uppercase text-stone-400">Buffer Preserved</div>
                          <div className="font-display font-bold text-stone-950 mt-0.5 tabular-nums">
                            {formatINR(plan.buffer_preserved || 0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-stone-100">
                    <button
                      type="button"
                      className={`w-full py-2.5 px-4 text-xs font-display font-semibold rounded-full transition-all ${
                        isSelected
                          ? "bg-stone-950 text-white shadow-soft-sm"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      {isSelected ? "Active Strategy" : "Select Strategy"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. KEY VISUAL: Recovery Trajectory Comparator Chart */}
          <div className="rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-soft-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
              <div>
                <h3 className="font-display font-bold text-base text-stone-950 tracking-tight">
                  Recovery Trajectory Comparator: 3 Deterministic Pathways
                </h3>
                <p className="text-xs text-stone-500">
                  Compare Aggressive vs Balanced vs Extended recovery curves against the unmitigated Stressed shock
                </p>
              </div>
            </div>

            <RecoveryChart
              aggressiveCurve={recoveryData?.curves?.aggressive || plans.find(p => p.plan_id === "aggressive")?.trajectory_curve}
              balancedCurve={recoveryData?.curves?.balanced || plans.find(p => p.plan_id === "balanced")?.trajectory_curve}
              extendedCurve={recoveryData?.curves?.extended || plans.find(p => p.plan_id === "extended")?.trajectory_curve}
              stressedCurve={recoveryData?.curves?.stressed}
              targetAmount={recoveryData?.target_amount || selectedGoal?.target_amount}
              targetDeadlineMonths={recoveryData?.target_deadline_months || selectedGoal?.target_months}
            />
          </div>

          {/* 3. IMPORTANT INSIGHT: AI Recovery Strategy Advisor */}
          <AIExplanationCard
            goalId={selectedGoalId}
            explanationType="recovery"
            title="AI Recovery Strategy Advisor: Trade-Off Analysis"
          />

          {/* 4. OPTIONAL DETAILS: Strategy Deep-Dive & Trade-Off Matrix */}
          {activePlan && (
            <div className="rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-soft-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div>
                  <h3 className="font-display font-bold text-stone-950 text-base tracking-tight">
                    Trade-Off Analysis: What This Strategy Costs You
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Strategic trade-offs for: <strong className="text-stone-800">{activePlan.name}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTradeOffDetails(!showTradeOffDetails)}
                  className="text-stone-400 hover:text-stone-900"
                >
                  {showTradeOffDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {showTradeOffDetails && (
                <div className="space-y-5 animate-fadeIn">
                  {/* 3 Metric Tiles */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                      <div className="text-stone-400 font-display font-bold text-[10px] uppercase tracking-wider">
                        Timeline Shift
                      </div>
                      <div className="text-2xl font-display font-bold text-stone-950 tabular-nums">
                        +{activePlan.slippage_months} Mos
                      </div>
                      <p className="text-stone-500 text-[11px]">
                        Target Month: M{activePlan.target_completion_month}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                      <div className="text-stone-400 font-display font-bold text-[10px] uppercase tracking-wider">
                        Discretionary Cut
                      </div>
                      <div className="text-2xl font-display font-bold text-emerald-800 tabular-nums">
                        {formatINR(activePlan.discretionary_savings_monthly)}/mo
                      </div>
                      <p className="text-stone-500 text-[11px]">
                        Trim {formatPercent(activePlan.discretionary_cut_percent * 100)} flexible spend
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                      <div className="text-stone-400 font-display font-bold text-[10px] uppercase tracking-wider">
                        Buffer Preserved
                      </div>
                      <div className="text-2xl font-display font-bold text-stone-950 tabular-nums">
                        {formatINR(activePlan.buffer_preserved || 0)}
                      </div>
                      <p className="text-stone-500 text-[11px]">
                        Time to recover: {activePlan.time_to_recover_months ? `${activePlan.time_to_recover_months} Mos` : "On Deadline"}
                      </p>
                    </div>
                  </div>

                  {activePlan.trade_offs && (
                    <p className="text-xs text-stone-700 bg-stone-50 p-4 rounded-2xl border border-stone-200/60 leading-relaxed font-serif italic text-sm">
                      {activePlan.trade_offs}
                    </p>
                  )}

                  {/* Pros & Cons Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-200/60 space-y-2">
                      <div className="font-display font-bold text-emerald-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Advantages (Pros)
                      </div>
                      <ul className="space-y-1.5 text-stone-600">
                        {activePlan.pros?.map((pro, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-200/60 space-y-2">
                      <div className="font-display font-bold text-rose-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        Costs & Sacrifices (Cons)
                      </div>
                      <ul className="space-y-1.5 text-stone-600">
                        {activePlan.cons?.map((con, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-rose-500 font-bold">•</span>
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Next Step Transition to Survival Map */}
          <div className="p-6 sm:p-8 rounded-3xl bg-stone-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-soft-sm">
            <div className="space-y-1">
              <div className="text-[10px] font-display font-bold uppercase tracking-wider text-emerald-400">
                Integrated Visualization
              </div>
              <h4 className="font-display font-bold text-base text-white">
                Validate Recovered Curve on Goal Survival Map
              </h4>
              <p className="text-xs text-stone-400 max-w-xl">
                Observe how your selected recovery plan repairs your liquid buffer runway and overcomes capital shortfalls.
              </p>
            </div>
            <Link
              href="/survival"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-display font-bold text-stone-950 bg-white hover:bg-stone-100 rounded-full transition-colors shrink-0"
            >
              <span>View Survival Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
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
