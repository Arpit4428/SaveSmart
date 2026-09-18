"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { BaselineProfile, Goal, SystemHealth, GoalHealthReport } from "@/types/api";
import { formatINR, formatPercent } from "@/lib/utils";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DemoPresetModal } from "@/components/ui/DemoPresetModal";
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ShieldAlert,
  Target,
  RefreshCw,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export default function DashboardPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalHealthMap, setGoalHealthMap] = useState<Record<string, GoalHealthReport>>({});
  const [baseline, setBaseline] = useState<BaselineProfile | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [healthData, goalsData, baselineData] = await Promise.all([
        api.getHealth().catch(() => null),
        api.getGoals().catch(() => []),
        api.getBaseline().catch(() => null),
      ]);
      setHealth(healthData);
      setGoals(goalsData);
      setBaseline(baselineData);

      // Load health metrics for active goals in parallel
      if (goalsData && goalsData.length > 0) {
        const healthEntries = await Promise.all(
          goalsData.map(async (g: Goal) => {
            try {
              const gh = await api.getGoalHealth(g.id);
              return [g.id, gh] as const;
            } catch {
              return null;
            }
          })
        );
        const map: Record<string, GoalHealthReport> = {};
        for (const entry of healthEntries) {
          if (entry && entry[1]) {
            map[entry[0]] = entry[1];
          }
        }
        setGoalHealthMap(map);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-2 text-stone-500 text-xs font-display">
          <RefreshCw className="w-4 h-4 animate-spin text-stone-900" />
          Loading SaveSmart dashboard...
        </div>
      </div>
    );
  }

  // Determine if attention is required
  const totalMonthlyCommitment = goals.reduce((sum, g) => sum + (g.monthly_contribution || 0), 0);
  const freeCashFlow = baseline?.summary?.net_free_cash_flow || 0;
  const isOvercommitted = totalMonthlyCommitment > freeCashFlow && freeCashFlow > 0;
  const fragileGoalCount = Object.values(goalHealthMap).filter(
    (h) => h.health_status === "AT_RISK" || h.health_status === "MODERATE_RISK"
  ).length;
  const attentionRequired = isOvercommitted || fragileGoalCount > 0;

  const primaryGoal = goals.length > 0 ? goals[0] : null;
  const primaryGoalHealth = primaryGoal ? goalHealthMap[primaryGoal.id] : null;
  const primaryGoalProgress = primaryGoal && primaryGoal.target_amount > 0
    ? (primaryGoal.current_balance / primaryGoal.target_amount) * 100
    : 0;

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Demo Preset Modal */}
      <DemoPresetModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onSuccess={() => loadData()}
      />

      {/* 1. HERO SECTION: Primary Goal & Core Status */}
      <div className="rounded-3xl border border-stone-200/80 bg-white p-8 sm:p-10 shadow-soft-sm space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-stone-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-[10px] font-display font-bold uppercase tracking-wider border border-stone-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Primary Target Goal
              </span>
              {primaryGoal && (
                <span className="text-xs font-display font-semibold text-stone-500 uppercase">
                  {primaryGoal.category} · {primaryGoal.target_months} Months
                </span>
              )}
              {primaryGoalHealth && (
                <Badge grade={primaryGoalHealth.health_status} className="text-[10px]" />
              )}
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-stone-950 tracking-tight">
              {primaryGoal ? primaryGoal.name : "Dream Home Down Payment"}
            </h1>

            <p className="text-xs sm:text-sm text-stone-500 font-sans leading-relaxed">
              {attentionRequired
                ? "Resilience warning: Monthly commitments approach cashflow headroom. Stress-testing recommended."
                : "Deterministic cash flow verification confirms capital solvency under baseline assumptions."}
            </p>
          </div>

          {/* Action Hub */}
          <div className="flex flex-wrap lg:justify-end items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsDemoModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-display font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200/80 border border-stone-200/80 rounded-full transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-stone-600" />
              Demo Presets
            </button>
            <Link
              href="/stress-test"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-display font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-full shadow-soft-sm transition-all active:scale-95"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Run Stress-Test
            </Link>
            <Link
              href="/goals"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-display font-semibold text-stone-900 bg-white hover:bg-stone-50 border border-stone-300/80 rounded-full shadow-soft-sm transition-all active:scale-95"
            >
              <Target className="w-3.5 h-3.5" />
              Create Goal
            </Link>
          </div>
        </div>

        {/* Primary Goal Progress Bar & Key Telemetry */}
        {primaryGoal && (
          <div className="space-y-3">
            <div className="flex justify-between items-baseline text-xs font-display">
              <span className="text-stone-500">
                Accumulated: <strong className="text-stone-950 font-bold tabular-nums text-sm">{formatINR(primaryGoal.current_balance)}</strong>
              </span>
              <span className="text-stone-500">
                Target: <strong className="text-stone-950 font-bold tabular-nums text-sm">{formatINR(primaryGoal.target_amount)}</strong> ({primaryGoalProgress.toFixed(0)}%)
              </span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-emerald-700 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, primaryGoalProgress))}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-display text-stone-400 pt-0.5">
              <span>Required: {formatINR(primaryGoal.monthly_contribution || 0)}/mo</span>
              <span>Horizon: {primaryGoal.target_months} Months Target</span>
            </div>
          </div>
        )}
      </div>

      {/* Attention Required Banner */}
      {attentionRequired && (
        <div className="p-5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-soft-sm">
          <div className="flex items-start sm:items-center gap-3">
            <span className="p-1.5 rounded-full bg-amber-200/70 text-amber-800 shrink-0 mt-0.5 sm:mt-0">
              <AlertCircle className="w-4 h-4" />
            </span>
            <div className="leading-relaxed">
              <span className="font-display font-bold uppercase tracking-wider text-[11px] text-amber-900">Resilience Alert: </span>
              {isOvercommitted ? (
                <span>
                  Total monthly commitments (<strong className="tabular-nums font-semibold">{formatINR(totalMonthlyCommitment)}</strong>/mo) exceed Free Cash Flow (<strong className="tabular-nums font-semibold">{formatINR(freeCashFlow)}</strong>/mo).
                </span>
              ) : (
                <span>
                  {fragileGoalCount} goal{fragileGoalCount > 1 ? "s" : ""} evaluated with AT_RISK or MODERATE_RISK baseline resilience.
                </span>
              )}{" "}
              Stress-testing is recommended.
            </div>
          </div>
          <Link
            href="/stress-test"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-900 text-amber-50 hover:bg-amber-950 font-display font-semibold transition-colors shrink-0 text-xs"
          >
            Launch Stress Test <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. KEY METRICS: 4 De-boxed Grouped Figures */}
      <div className="rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-soft-sm grid grid-cols-2 sm:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-stone-100">
        <div className="space-y-1">
          <div className="text-[10px] font-display font-bold uppercase tracking-wider text-emerald-800">
            NET FREE CASH FLOW
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-stone-950 tracking-tight tabular-nums">
            {formatINR(baseline?.summary?.net_free_cash_flow || 0)}
          </div>
          <p className="text-[11px] text-stone-400">
            Capacity: {formatPercent(baseline?.summary?.savings_capacity_percent || 0)}
          </p>
        </div>

        <div className="space-y-1 sm:pl-6 pt-4 sm:pt-0">
          <div className="text-[10px] font-display font-bold uppercase tracking-wider text-stone-400">
            NET MONTHLY INCOME
          </div>
          <div className="text-2xl sm:text-3xl font-display font-bold text-stone-950 tracking-tight tabular-nums">
            {formatINR(baseline?.monthly_net_income || 0)}
          </div>
          <p className="text-[11px] text-stone-400">Take-home in INR</p>
        </div>

        <div className="space-y-1 sm:pl-6 pt-4 sm:pt-0">
          <div className="text-[10px] font-display font-bold uppercase tracking-wider text-stone-400">
            EMERGENCY CUSHION
          </div>
          <div className="text-2xl sm:text-3xl font-display font-bold text-stone-950 tracking-tight tabular-nums">
            {formatINR(baseline?.emergency_fund_balance || 0)}
          </div>
          <p className="text-[11px] text-stone-400">Instant liquid buffer</p>
        </div>

        <div className="space-y-1 sm:pl-6 pt-4 sm:pt-0">
          <div className="text-[10px] font-display font-bold uppercase tracking-wider text-stone-400">
            ACTIVE GOALS
          </div>
          <div className="text-2xl sm:text-3xl font-display font-bold text-stone-950 tracking-tight tabular-nums">
            {goals.length} <span className="text-xs font-normal text-stone-400">Targets</span>
          </div>
          <p className="text-[11px] text-stone-400">Monitored for resilience</p>
        </div>
      </div>

      {/* 3. GOALS LIST & QUICK LINKS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 Cols: Goals List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-soft-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <h3 className="font-serif italic text-2xl sm:text-3xl text-stone-950">Active Savings Goals</h3>
                <p className="text-xs text-stone-500 mt-0.5">Evaluated against cash flow capacity</p>
              </div>
              <Link
                href="/goals"
                className="text-xs font-display font-semibold text-stone-800 hover:text-stone-950 px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors"
              >
                Manage Goals <ArrowRight className="w-3 h-3 inline ml-1" />
              </Link>
            </div>

            {goals.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-500 space-y-3">
                <p className="text-stone-800 font-display font-semibold text-sm">No savings goals registered yet</p>
                <p className="text-stone-400 max-w-sm mx-auto">Set up your first financial target or load verified Indian demo scenarios.</p>
                <div className="flex justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsDemoModalOpen(true)}
                    className="px-4 py-2 text-xs font-display font-semibold text-stone-800 bg-stone-100 rounded-full"
                  >
                    Load Demo Scenarios
                  </button>
                  <Link
                    href="/goals"
                    className="px-4 py-2 text-xs font-display font-semibold text-white bg-stone-900 rounded-full"
                  >
                    Create Custom Goal
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {goals.map((g) => {
                  const progressPct = g.target_amount > 0 ? (g.current_balance / g.target_amount) * 100 : 0;
                  const gHealth = goalHealthMap[g.id];

                  return (
                    <div key={g.id} className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-display font-semibold text-base text-stone-950">{g.name}</h4>
                          <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-display font-semibold border border-stone-200">
                            {g.category}
                          </span>
                          <span className="text-xs text-stone-400 font-display">{g.target_months} mos</span>
                          {gHealth && <Badge grade={gHealth.health_status} className="text-[10px]" />}
                        </div>

                        <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-700 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-xs text-stone-500 tabular-nums font-display">
                          <span>Accumulated: <strong className="text-stone-800">{formatINR(g.current_balance)}</strong></span>
                          <span>Target: <strong className="text-stone-800">{formatINR(g.target_amount)}</strong> ({progressPct.toFixed(0)}%)</span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 gap-2 shrink-0">
                        <div className="text-right">
                          <div className="text-[10px] uppercase font-display text-stone-400">Monthly SIP</div>
                          <div className="font-display font-bold text-base text-stone-950 tabular-nums">
                            {formatINR(g.monthly_contribution || 0)}/mo
                          </div>
                        </div>
                        <Link
                          href="/stress-test"
                          className="inline-flex items-center gap-1 text-xs font-display font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1 rounded-full transition-colors"
                        >
                          Stress-Test <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Flow Navigation Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/stress-test" className="block group">
              <div className="rounded-2xl border border-stone-200/80 bg-white hover:border-stone-400 transition-all p-5 shadow-soft-sm">
                <span className="p-2 rounded-xl bg-stone-100 text-rose-700 inline-block mb-2 group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-4 h-4" />
                </span>
                <h4 className="font-display font-semibold text-sm text-stone-950">Stress-Test Lab</h4>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  Test job disruption & compound cascades.
                </p>
              </div>
            </Link>

            <Link href="/recovery" className="block group">
              <div className="rounded-2xl border border-stone-200/80 bg-white hover:border-stone-400 transition-all p-5 shadow-soft-sm">
                <span className="p-2 rounded-xl bg-stone-100 text-emerald-800 inline-block mb-2 group-hover:scale-105 transition-transform">
                  <RefreshCw className="w-4 h-4" />
                </span>
                <h4 className="font-display font-semibold text-sm text-stone-950">Recovery Planner</h4>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  Solve 3 deterministic recovery paths.
                </p>
              </div>
            </Link>

            <Link href="/survival" className="block group">
              <div className="rounded-2xl border border-stone-200/80 bg-white hover:border-stone-400 transition-all p-5 shadow-soft-sm">
                <span className="p-2 rounded-xl bg-stone-100 text-stone-800 inline-block mb-2 group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <h4 className="font-display font-semibold text-sm text-stone-950">Goal Survival Map</h4>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  Multi-month balance curves & safe runway.
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Right 4 Cols: Baseline Profile Summary */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-7 shadow-soft-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-display font-semibold text-base text-stone-950">Baseline Profile</h3>
                <p className="text-xs text-stone-500">Verified cash flow allocation</p>
              </div>
              <Link
                href="/baseline"
                className="text-xs font-display font-semibold text-stone-800 hover:text-stone-950 px-3 py-1 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors"
              >
                Edit
              </Link>
            </div>

            {baseline ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-500">Fixed Obligations</span>
                  <span className="font-semibold text-stone-950 tabular-nums font-display">
                    {formatINR(baseline.summary?.total_fixed_expenses || 0)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-500">Discretionary Spend</span>
                  <span className="font-semibold text-stone-950 tabular-nums font-display">
                    {formatINR(baseline.summary?.total_discretionary_expenses || 0)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-500">Debt Commitments</span>
                  <span className="font-semibold text-stone-950 tabular-nums font-display">
                    {formatINR(baseline.summary?.total_debt_payments || 0)}
                  </span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-stone-100 font-medium">
                  <span className="text-stone-950 font-semibold">Net Free Cash Flow</span>
                  <span className="text-emerald-800 font-bold font-display text-sm tabular-nums">
                    {formatINR(baseline.summary?.net_free_cash_flow || 0)}
                  </span>
                </div>

                <div className="pt-2">
                  <div className="text-xs text-stone-500 mb-1.5 font-display">Savings Capacity Margin</div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-700 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, (baseline.summary?.savings_capacity_percent || 0) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-stone-400 mt-1 tabular-nums font-display">
                    <span>Target: 20-30%</span>
                    <span className="font-semibold text-stone-700">
                      {formatPercent(baseline.summary?.savings_capacity_percent || 0)}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                  <span>Standard: Indian Rupee (₹)</span>
                  <span className="inline-flex items-center gap-1 text-emerald-800 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-stone-500 space-y-2">
                <p>No baseline profile registered yet.</p>
                <Link
                  href="/baseline"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-full text-xs font-semibold"
                >
                  Configure Baseline <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
