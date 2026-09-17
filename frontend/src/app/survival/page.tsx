"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Goal, SurvivalMapData } from "@/types/api";
import { formatINR } from "@/lib/utils";
import { Card, CardHeader } from "@/components/ui/Card";
import { SurvivalChart } from "@/components/charts/SurvivalChart";
import { RefreshCw, AlertCircle, TrendingUp, ShieldCheck, HelpCircle } from "lucide-react";

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
      },
    ], 30)
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Goal Survival Map & Comparator</h1>
        <p className="text-sm text-slate-500 mt-1">
          Simultaneously compare your Baseline trajectory vs. Stressed shock impact vs. Balanced Recovery strategy.
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
            <label className="text-xs font-semibold text-slate-700">ANALYZE GOAL:</label>
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
              Baseline Curve
            </span>
            <span className="flex items-center gap-1.5 text-rose-600">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              Stressed Curve
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              Recovered Curve
            </span>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="py-24 flex justify-center items-center text-sm text-slate-500">
          <RefreshCw className="w-4 h-4 animate-spin mr-2 text-emerald-600" /> Generating coordinate trajectories...
        </div>
      ) : survivalData ? (
        <>
          {/* Main Survival Map Chart */}
          <Card>
            <CardHeader
              title="Multi-Scenario Goal Survival Map"
              subtitle="Cumulative goal balance across a 30-month horizon in INR (₹)"
            />
            <SurvivalChart
              baselineCurve={survivalData.curves.baseline}
              stressedCurve={survivalData.curves.stressed}
              recoveredCurve={survivalData.curves.recovered_balanced}
              targetAmount={selectedGoal?.target_amount}
            />
          </Card>

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
                  {[3, 6, 12, 18, 24, 30].map((m) => {
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
        </>
      ) : null}
    </div>
  );
}
