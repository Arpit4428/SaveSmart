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
  Compass,
  ArrowRight,
} from "lucide-react";

export default function SurvivalMapPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [survivalData, setSurvivalData] = useState<SurvivalMapData | null>(null);
  const [loading, setLoading] = useState(false);
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
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
          label: "GOAL SURVIVED",
        };
      case "DELAYED":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          icon: <Clock className="w-4 h-4 text-amber-600 shrink-0" />,
          label: "GOAL DELAYED",
        };
      default:
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          icon: <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />,
          label: "CRITICAL SHORTFALL",
        };
    }
  };

  const statusInfo = getStatusBadge(survivalData?.final_status);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-stone-100 border border-stone-200/60 text-[11px] font-medium text-stone-600 mb-2">
            <span>Step 4 of 5</span>
            <span className="text-stone-300">•</span>
            <span>Disruption Durability</span>
          </div>
          <h1 className="text-3xl font-semibold text-stone-950 tracking-tight">
            Goal Survival Map & Durability Analysis
          </h1>
          <p className="text-sm text-stone-500 mt-1 max-w-2xl">
            Answers the core question: <span className="font-semibold text-stone-900">&ldquo;Will my financial goal survive this disruption?&rdquo;</span>
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-sm flex items-center gap-2.5 shadow-soft-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Goal Selector Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-stone-700 tracking-wider uppercase whitespace-nowrap">SELECT GOAL:</label>
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

          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-stone-700">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-800" />
              Baseline Plan
            </span>
            <span className="flex items-center gap-1.5 text-rose-600">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              Stressed Shock
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              Recovered Path
            </span>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="py-24 flex flex-col justify-center items-center text-sm text-stone-500">
          <RefreshCw className="w-5 h-5 animate-spin mb-2 text-stone-400" />
          <span>Computing survival trajectories & safe buffer runway...</span>
        </div>
      ) : survivalData ? (
        <>
          {/* Survival Verdict Banner */}
          <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-soft-sm ${statusInfo.bg}`}>
            <div className="flex items-start gap-3.5">
              <div className="mt-0.5">{statusInfo.icon}</div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    {statusInfo.label}
                  </span>
                  <span className="text-stone-300">•</span>
                  <span className="text-xs text-stone-600 tabular-nums font-medium">
                    Target: {formatINR(survivalData.target_amount || selectedGoal?.target_amount || 0)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-stone-950 mt-1 tracking-tight">
                  {survivalData.survival_verdict || "Simulation analysis calculated successfully."}
                </h3>
              </div>
            </div>
            <div className="text-right shrink-0 sm:border-l sm:border-stone-200/70 sm:pl-6">
              <div className="text-[10px] uppercase font-semibold text-stone-500 tracking-wider">Target Deadline</div>
              <div className="text-xl font-bold text-stone-950 tabular-nums mt-0.5">
                Month {survivalData.target_deadline_months || selectedGoal?.target_months || 0}
              </div>
            </div>
          </div>

          {/* 6 Analytical Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Card className="p-4">
              <div className="text-[11px] font-medium text-stone-500 tracking-wider uppercase">SURVIVAL STATUS</div>
              <div className={`text-base font-bold mt-1 tracking-tight ${
                survivalData.final_status === "SURVIVED" ? "text-emerald-700" :
                survivalData.final_status === "DELAYED" ? "text-amber-700" : "text-rose-700"
              }`}>
                {survivalData.final_status || "ANALYZED"}
              </div>
              <div className="text-[11px] text-stone-400 mt-1">Post-stress durability</div>
            </Card>

            <Card className="p-4">
              <div className="text-[11px] font-medium text-stone-500 tracking-wider uppercase">FIRST UNSAFE MONTH</div>
              <div className="text-base font-bold text-stone-950 mt-1 tabular-nums">
                {survivalData.first_unsafe_month ? `Month ${survivalData.first_unsafe_month}` : "None (Safe)"}
              </div>
              <div className="text-[11px] text-stone-400 mt-1">Below buffer floor</div>
            </Card>

            <Card className="p-4">
              <div className="text-[11px] font-medium text-stone-500 tracking-wider uppercase">MAX DRAWDOWN</div>
              <div className="text-base font-bold text-rose-700 mt-1 tabular-nums">
                {formatINR(survivalData.max_drawdown || 0)}
              </div>
              <div className="text-[11px] text-stone-400 mt-1">Peak deficit vs base</div>
            </Card>

            <Card className="p-4">
              <div className="text-[11px] font-medium text-stone-500 tracking-wider uppercase">DEADLINE SLIPPAGE</div>
              <div className="text-base font-bold text-amber-700 mt-1 tabular-nums">
                +{survivalData.deadline_slippage || 0} Mos
              </div>
              <div className="text-[11px] text-stone-400 mt-1">Unmitigated delay</div>
            </Card>

            <Card className="p-4">
              <div className="text-[11px] font-medium text-stone-500 tracking-wider uppercase">CAPITAL SHORTFALL</div>
              <div className="text-base font-bold text-rose-700 mt-1 tabular-nums">
                {formatINR(survivalData.capital_shortfall || 0)}
              </div>
              <div className="text-[11px] text-stone-400 mt-1">At target deadline</div>
            </Card>

            <Card className="p-4">
              <div className="text-[11px] font-medium text-stone-500 tracking-wider uppercase">RECOVERY POINT</div>
              <div className="text-base font-bold text-emerald-700 mt-1 tabular-nums">
                {survivalData.recovery_point_month ? `Month ${survivalData.recovery_point_month}` : "Post-Horizon"}
              </div>
              <div className="text-[11px] text-stone-400 mt-1">Balanced plan parity</div>
            </Card>
          </div>

          {/* AI Explanation Layer */}
          <AIExplanationCard
            goalId={selectedGoalId}
            explanationType="survival"
            title="AI Goal Survival Map Interpretation"
          />

          {/* Trajectory Comparison Chart */}
          <Card>
            <CardHeader
              title="Multi-Scenario Cumulative Goal Trajectory"
              subtitle={`Simulated capital accumulation across ${survivalData.total_months} months in INR (₹)`}
            />
            <SurvivalChart
              baselineCurve={survivalData.curves.baseline}
              stressedCurve={survivalData.curves.stressed}
              recoveredCurve={survivalData.curves.recovered_balanced}
              targetAmount={survivalData.target_amount || selectedGoal?.target_amount}
              targetDeadlineMonths={survivalData.target_deadline_months || selectedGoal?.target_months}
              firstUnsafeMonth={survivalData.first_unsafe_month}
              recoveryPointMonth={survivalData.recovery_point_month}
            />
          </Card>

          {/* Safety Buffer Runway Chart */}
          {survivalData.buffer_curves && (
            <Card>
              <CardHeader
                title="Liquid Safety Buffer Runway"
                subtitle="Emergency fund balance compared against safe threshold and insolvency floor in INR (₹)"
              />
              <BufferRunwayChart
                baselineCurve={survivalData.buffer_curves.baseline}
                stressedCurve={survivalData.buffer_curves.stressed}
                recoveredCurve={survivalData.buffer_curves.recovered_balanced}
                safeBufferThreshold={survivalData.safe_buffer_threshold}
              />
            </Card>
          )}

          {/* Comparative Month Milestones */}
          <Card>
            <CardHeader
              title="Milestone Comparative Table"
              subtitle="Quarterly checkpoints comparing the impact of shocks and recovery"
            />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 font-semibold">
                    <th className="py-3 px-4">Timeline</th>
                    <th className="py-3 px-4 text-stone-700">Baseline Target</th>
                    <th className="py-3 px-4 text-rose-700">Stressed Shock</th>
                    <th className="py-3 px-4 text-emerald-700">Balanced Recovery</th>
                    <th className="py-3 px-4 text-right">Recovery Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {[3, 6, 12, 18, 24, 30, 36].map((m) => {
                    if (m >= survivalData.curves.baseline.length) return null;
                    const b = survivalData.curves.baseline[m] || 0;
                    const s = survivalData.curves.stressed[m] || 0;
                    const r = survivalData.curves.recovered_balanced[m] || 0;
                    const delta = r - s;

                    return (
                      <tr key={m} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-4 font-medium text-stone-900">Month {m}</td>
                        <td className="py-3 px-4 tabular-nums text-stone-600">{formatINR(b)}</td>
                        <td className="py-3 px-4 tabular-nums text-rose-700">{formatINR(s)}</td>
                        <td className="py-3 px-4 tabular-nums text-emerald-700 font-medium">{formatINR(r)}</td>
                        <td className="py-3 px-4 text-right tabular-nums font-semibold text-emerald-700">
                          {delta > 0 ? `+${formatINR(delta)}` : formatINR(delta)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Next Step Transition CTA */}
          <div className="p-6 rounded-2xl bg-stone-900 text-white shadow-soft-md flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                Recommended Next Step
              </div>
              <h4 className="font-semibold text-base text-white mt-1">
                Compare Recovery Pathways for This Disruption
              </h4>
              <p className="text-xs text-stone-400 mt-1 max-w-xl leading-relaxed">
                Evaluate deterministic trade-offs between aggressive flexible spending cuts and extended completion deadlines.
              </p>
            </div>
            <Link
              href="/recovery"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-stone-900 bg-white hover:bg-stone-100 rounded-xl transition-colors shadow-soft-sm shrink-0"
            >
              Open Adaptive Recovery Planner <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Transparent Assumptions Ledger */}
          {survivalData.assumption_ledger && (
            <AssumptionLedger ledger={survivalData.assumption_ledger} />
          )}
        </>
      ) : null}
    </div>
  );
}
