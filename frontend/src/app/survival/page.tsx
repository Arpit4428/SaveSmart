"use client";

import React, { useEffect, useState } from "react";
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
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs uppercase tracking-wider">
          <Compass className="w-4 h-4" /> Analytical Core Feature
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
          Goal Survival Map & Durability Analysis
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Answers the core question: <span className="font-semibold text-slate-700">&ldquo;Will my financial goal survive this disruption?&rdquo;</span>
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Goal Selector Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-700">SELECT GOAL:</label>
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

          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-blue-600">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
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
        <div className="py-24 flex justify-center items-center text-sm text-slate-500">
          <RefreshCw className="w-4 h-4 animate-spin mr-2 text-emerald-600" /> Computing survival trajectories & runway...
        </div>
      ) : survivalData ? (
        <>
          {/* Survival Verdict Banner */}
          <div className={`p-5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${statusInfo.bg}`}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{statusInfo.icon}</div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {statusInfo.label}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Target: {formatINR(survivalData.target_amount || selectedGoal?.target_amount || 0)}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {survivalData.survival_verdict || "Simulation analysis calculated successfully."}
                </h3>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[10px] uppercase font-semibold text-slate-500">Target Deadline</div>
              <div className="text-base font-bold text-slate-900">
                Month {survivalData.target_deadline_months || selectedGoal?.target_months || 0}
              </div>
            </div>
          </div>

          {/* 6 Analytical Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Card className="p-3.5">
              <div className="text-[11px] font-medium text-slate-500">SURVIVAL STATUS</div>
              <div className={`text-sm font-bold mt-1 ${
                survivalData.final_status === "SURVIVED" ? "text-emerald-600" :
                survivalData.final_status === "DELAYED" ? "text-amber-600" : "text-rose-600"
              }`}>
                {survivalData.final_status || "ANALYZED"}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Post-stress durability</div>
            </Card>

            <Card className="p-3.5">
              <div className="text-[11px] font-medium text-slate-500">FIRST UNSAFE MONTH</div>
              <div className="text-sm font-bold text-slate-900 mt-1">
                {survivalData.first_unsafe_month ? `Month ${survivalData.first_unsafe_month}` : "None (Safe)"}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Below buffer floor</div>
            </Card>

            <Card className="p-3.5">
              <div className="text-[11px] font-medium text-slate-500">MAX DRAWDOWN</div>
              <div className="text-sm font-bold text-rose-600 mt-1 font-mono">
                {formatINR(survivalData.max_drawdown || 0)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Peak deficit vs base</div>
            </Card>

            <Card className="p-3.5">
              <div className="text-[11px] font-medium text-slate-500">DEADLINE SLIPPAGE</div>
              <div className="text-sm font-bold text-amber-600 mt-1">
                +{survivalData.deadline_slippage || 0} Mos
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Unmitigated delay</div>
            </Card>

            <Card className="p-3.5">
              <div className="text-[11px] font-medium text-slate-500">CAPITAL SHORTFALL</div>
              <div className="text-sm font-bold text-rose-600 mt-1 font-mono">
                {formatINR(survivalData.capital_shortfall || 0)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">At target deadline</div>
            </Card>

            <Card className="p-3.5">
              <div className="text-[11px] font-medium text-slate-500">RECOVERY POINT</div>
              <div className="text-sm font-bold text-emerald-600 mt-1">
                {survivalData.recovery_point_month ? `Month ${survivalData.recovery_point_month}` : "Post-Horizon"}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Balanced plan parity</div>
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
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-2.5 px-3">Timeline</th>
                    <th className="py-2.5 px-3 text-blue-700">Baseline Target</th>
                    <th className="py-2.5 px-3 text-rose-700">Stressed Shock</th>
                    <th className="py-2.5 px-3 text-emerald-700">Balanced Recovery</th>
                    <th className="py-2.5 px-3 text-right">Recovery Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[3, 6, 12, 18, 24, 30, 36].map((m) => {
                    if (m >= survivalData.curves.baseline.length) return null;
                    const b = survivalData.curves.baseline[m] || 0;
                    const s = survivalData.curves.stressed[m] || 0;
                    const r = survivalData.curves.recovered_balanced[m] || 0;
                    const delta = r - s;

                    return (
                      <tr key={m} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-medium text-slate-900">Month {m}</td>
                        <td className="py-2.5 px-3 font-mono">{formatINR(b)}</td>
                        <td className="py-2.5 px-3 font-mono text-rose-600">{formatINR(s)}</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-600 font-semibold">{formatINR(r)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-700">
                          {delta > 0 ? `+${formatINR(delta)}` : formatINR(delta)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Transparent Assumptions Ledger */}
          {survivalData.assumption_ledger && (
            <AssumptionLedger ledger={survivalData.assumption_ledger} />
          )}
        </>
      ) : null}
    </div>
  );
}
