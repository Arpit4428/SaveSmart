"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { Goal, SurvivalMapData } from "@/types/api";
import { formatINR } from "@/lib/utils";
import { Card, CardHeader } from "@/components/ui/Card";
import { SurvivalChart } from "@/components/charts/SurvivalChart";
import { BufferRunwayChart } from "@/components/charts/BufferRunwayChart";
import { AssumptionLedger } from "@/components/ui/AssumptionLedger";
import { AIExplanationCard } from "@/components/ui/AIExplanationCard";
import {
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingDown,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Table,
  Layers,
} from "lucide-react";

export default function SurvivalMapPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [survivalData, setSurvivalData] = useState<SurvivalMapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Progressive disclosure accordions
  const [showBufferChart, setShowBufferChart] = useState(false);
  const [showMilestones, setShowMilestones] = useState(false);
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
    api.getSurvivalMap(selectedGoalId, [
      {
        shock_type: "income_drop",
        start_month: 2,
        duration_months: 4,
        magnitude_percent: 0.35,
        description: "Simulated 35% Income Disruption",
      },
    ], 36)
      .then((res) => {
        setSurvivalData(res);
      })
      .catch((err: any) => {
        setError(err.message || "Failed to load survival map.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedGoalId]);

  const selectedGoal = goals.find((g) => g.id === selectedGoalId);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "SURVIVED":
        return {
          bg: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
          label: "GOAL SURVIVED",
        };
      case "DELAYED":
        return {
          bg: "bg-amber-50 text-amber-900 border-amber-200/80",
          icon: <Clock className="w-4 h-4 text-amber-600 shrink-0" />,
          label: "GOAL DELAYED",
        };
      default:
        return {
          bg: "bg-rose-50 text-rose-900 border-rose-200/80",
          icon: <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />,
          label: "CRITICAL SHORTFALL",
        };
    }
  };

  const statusInfo = getStatusBadge(survivalData?.final_status);

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Top Editorial Header & Selector */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-200/50 border border-stone-300/60 text-[10px] font-display font-medium text-stone-700 tracking-wider uppercase mb-2">
            <span>Primary Analytical Feature</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-stone-950 tracking-tight">
            Goal Survival Map
          </h1>
          <p className="text-base sm:text-lg text-stone-600 font-serif italic mt-1">
            &ldquo;Will my financial goal survive this disruption?&rdquo;
          </p>
        </div>

        {/* Goal Selector */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-display font-bold uppercase text-stone-400">Goal:</label>
          <select
            value={selectedGoalId}
            onChange={(e) => setSelectedGoalId(e.target.value)}
            className="text-xs font-display font-semibold px-3 py-2 border border-stone-300/80 rounded-full bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 shadow-soft-sm"
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
          <span className="font-display font-medium">Computing survival trajectories & safe buffer runway...</span>
        </div>
      ) : survivalData ? (
        <>
          {/* 1. PRIMARY RESULT: Verdict Banner */}
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-soft-sm ${statusInfo.bg}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-display font-bold uppercase tracking-wider bg-white/90 border border-current/20 shadow-soft-sm">
                    {statusInfo.icon}
                    {statusInfo.label}
                  </span>
                  <span className="text-stone-300">/</span>
                  <span className="text-xs font-display text-stone-700 font-medium">
                    Target: <strong className="font-bold">{formatINR(survivalData.target_amount || selectedGoal?.target_amount || 0)}</strong>
                  </span>
                  <span className="text-stone-300">/</span>
                  <span className="text-xs font-display text-stone-600">
                    Horizon: {survivalData.total_months} Mos
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-stone-950 tracking-tight leading-snug">
                  {survivalData.survival_verdict || "Simulation analysis calculated successfully."}
                </h2>
              </div>

              <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center shrink-0 pt-3 sm:pt-0 sm:border-l sm:border-stone-300/60 sm:pl-8">
                <span className="text-[10px] uppercase font-display font-bold text-stone-500 tracking-wider">Target Deadline</span>
                <span className="text-3xl sm:text-4xl font-display font-bold text-stone-950 tabular-nums tracking-tight">
                  Month {survivalData.target_deadline_months || selectedGoal?.target_months || 0}
                </span>
              </div>
            </div>
          </div>

          {/* 2. KEY VISUAL (HERO): Dominant Trajectory Chart */}
          <div className="rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-soft-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
              <div>
                <h3 className="font-display font-bold text-base text-stone-950 tracking-tight">
                  Cumulative Goal Trajectory: Baseline vs Stressed vs Recovered
                </h3>
                <p className="text-xs text-stone-500">
                  Visualizes multi-month capital accumulation under disruption in INR (₹)
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-display font-medium">
                <span className="flex items-center gap-1.5 text-stone-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-800" /> Baseline
                </span>
                <span className="flex items-center gap-1.5 text-rose-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> Stressed
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Recovered
                </span>
              </div>
            </div>

            <SurvivalChart
              baselineCurve={survivalData.curves.baseline}
              stressedCurve={survivalData.curves.stressed}
              recoveredCurve={survivalData.curves.recovered_balanced}
              targetAmount={survivalData.target_amount || selectedGoal?.target_amount}
              targetDeadlineMonths={survivalData.target_deadline_months || selectedGoal?.target_months}
              firstUnsafeMonth={survivalData.first_unsafe_month}
              recoveryPointMonth={survivalData.recovery_point_month}
              delayedCompletionMonth={
                survivalData.deadline_slippage && survivalData.target_deadline_months
                  ? survivalData.target_deadline_months + survivalData.deadline_slippage
                  : null
              }
            />
          </div>

          {/* 3. KEY METRICS: 4 Core Analytical Figures (De-boxed Sleek Row) */}
          <div className="rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-soft-sm grid grid-cols-2 sm:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-stone-100">
            <div className="space-y-1">
              <div className="text-[10px] font-display font-bold uppercase tracking-wider text-stone-400">FIRST UNSAFE MONTH</div>
              <div className="text-2xl sm:text-3xl font-display font-bold text-stone-950 tabular-nums">
                {survivalData.first_unsafe_month ? `Month ${survivalData.first_unsafe_month}` : "None (Safe)"}
              </div>
              <p className="text-[11px] text-stone-400">Buffer floor breach</p>
            </div>

            <div className="space-y-1 sm:pl-6 pt-4 sm:pt-0">
              <div className="text-[10px] font-display font-bold uppercase tracking-wider text-stone-400">MAX DRAWDOWN</div>
              <div className="text-2xl sm:text-3xl font-display font-bold text-rose-700 tabular-nums">
                {formatINR(survivalData.max_drawdown || 0)}
              </div>
              <p className="text-[11px] text-stone-400">Peak deficit vs baseline</p>
            </div>

            <div className="space-y-1 sm:pl-6 pt-4 sm:pt-0">
              <div className="text-[10px] font-display font-bold uppercase tracking-wider text-stone-400">DEADLINE SLIPPAGE</div>
              <div className="text-2xl sm:text-3xl font-display font-bold text-amber-700 tabular-nums">
                +{survivalData.deadline_slippage || 0} Mos
              </div>
              <p className="text-[11px] text-stone-400">Unmitigated delay</p>
            </div>

            <div className="space-y-1 sm:pl-6 pt-4 sm:pt-0">
              <div className="text-[10px] font-display font-bold uppercase tracking-wider text-stone-400">RECOVERY POINT</div>
              <div className="text-2xl sm:text-3xl font-display font-bold text-emerald-800 tabular-nums">
                {survivalData.recovery_point_month ? `Month ${survivalData.recovery_point_month}` : "Post-Horizon"}
              </div>
              <p className="text-[11px] text-stone-400">Target parity reached</p>
            </div>
          </div>

          {/* 4. IMPORTANT INSIGHT: AI Explanation Layer */}
          <AIExplanationCard
            goalId={selectedGoalId}
            explanationType="survival"
            title="AI Goal Survival Map Interpretation"
          />

          {/* 5. OPTIONAL DETAILS: Progressive Disclosure Accordions */}
          <div className="space-y-3 pt-2">
            {/* Accordion 1: Liquid Safety Buffer Runway */}
            {survivalData.buffer_curves && (
              <div className="rounded-2xl border border-stone-200/80 bg-white shadow-soft-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowBufferChart(!showBufferChart)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-stone-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-stone-100 text-stone-700">
                      <TrendingDown className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="font-display font-semibold text-sm text-stone-950">
                        Liquid Safety Buffer Runway Chart
                      </h4>
                      <p className="text-xs text-stone-400">Emergency fund balance compared against safe threshold</p>
                    </div>
                  </div>
                  <span className="text-stone-400">
                    {showBufferChart ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                {showBufferChart && (
                  <div className="p-6 border-t border-stone-100 bg-stone-50/30">
                    <BufferRunwayChart
                      baselineCurve={survivalData.buffer_curves.baseline}
                      stressedCurve={survivalData.buffer_curves.stressed}
                      recoveredCurve={survivalData.buffer_curves.recovered_balanced}
                      safeBufferThreshold={survivalData.safe_buffer_threshold}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Accordion 2: Milestone Table */}
            <div className="rounded-2xl border border-stone-200/80 bg-white shadow-soft-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setShowMilestones(!showMilestones)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-stone-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-stone-100 text-stone-700">
                    <Table className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="font-display font-semibold text-sm text-stone-950">
                      Quarterly Milestone Comparison Table
                    </h4>
                    <p className="text-xs text-stone-400">Quarterly numeric checkpoints across 36 months</p>
                  </div>
                </div>
                <span className="text-stone-400">
                  {showMilestones ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              {showMilestones && (
                <div className="p-6 border-t border-stone-100 overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-400 font-display font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">Timeline</th>
                        <th className="py-2.5 px-3 text-stone-700">Baseline Target</th>
                        <th className="py-2.5 px-3 text-rose-700">Stressed Shock</th>
                        <th className="py-2.5 px-3 text-emerald-800">Balanced Recovery</th>
                        <th className="py-2.5 px-3 text-right">Delta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-display text-xs">
                      {[3, 6, 12, 18, 24, 30, 36].map((m) => {
                        if (m >= survivalData.curves.baseline.length) return null;
                        const b = survivalData.curves.baseline[m] || 0;
                        const s = survivalData.curves.stressed[m] || 0;
                        const r = survivalData.curves.recovered_balanced[m] || 0;
                        const delta = r - s;

                        return (
                          <tr key={m} className="hover:bg-stone-50/70 transition-colors">
                            <td className="py-2.5 px-3 font-semibold text-stone-900">Month {m}</td>
                            <td className="py-2.5 px-3 tabular-nums text-stone-600">{formatINR(b)}</td>
                            <td className="py-2.5 px-3 tabular-nums text-rose-700">{formatINR(s)}</td>
                            <td className="py-2.5 px-3 tabular-nums text-emerald-800 font-semibold">{formatINR(r)}</td>
                            <td className="py-2.5 px-3 text-right tabular-nums font-bold text-emerald-800">
                              {delta > 0 ? `+${formatINR(delta)}` : formatINR(delta)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Accordion 3: Assumptions Ledger */}
            {survivalData.assumption_ledger && (
              <div className="rounded-2xl border border-stone-200/80 bg-white shadow-soft-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowLedger(!showLedger)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-stone-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-stone-100 text-stone-700">
                      <Layers className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="font-display font-semibold text-sm text-stone-950">
                        Financial Assumptions Ledger
                      </h4>
                      <p className="text-xs text-stone-400">Underlying inflation, return rates, and emergency reserve rules</p>
                    </div>
                  </div>
                  <span className="text-stone-400">
                    {showLedger ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                {showLedger && (
                  <div className="p-6 border-t border-stone-100">
                    <AssumptionLedger ledger={survivalData.assumption_ledger} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Transition to Recovery Planner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-stone-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-soft-sm">
            <div className="space-y-1">
              <div className="text-[10px] font-display font-bold uppercase tracking-wider text-emerald-400">
                Recovery Blueprint Available
              </div>
              <h4 className="font-display font-bold text-base text-white">
                Compare 3 Algorithmic Recovery Pathways
              </h4>
              <p className="text-xs text-stone-400 max-w-xl">
                Evaluate deterministic trade-offs between boosting flexible savings vs extending target deadlines.
              </p>
            </div>
            <Link
              href="/recovery"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-display font-bold text-stone-950 bg-white hover:bg-stone-100 rounded-full transition-colors shrink-0"
            >
              <span>Open Recovery Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
