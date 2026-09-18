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
  Wallet,
  Target,
  RefreshCw,
  Sparkles,
  ShieldCheck,
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
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
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

  return (
    <div className="space-y-8">
      {/* Demo Preset Modal */}
      <DemoPresetModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onSuccess={() => loadData()}
      />

      {/* Top Banner / System Status */}
      <div className="space-y-4 pb-6 border-b border-stone-200/70">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-100 border border-stone-200/70 text-[11px] text-stone-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
            <span>Stress-test your financial goals before you commit.</span>
          </div>

          {/* 5-Step Process Sequence */}
          <div className="hidden md:flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-stone-400">
            <span className="text-stone-700 font-semibold">Build</span>
            <span>→</span>
            <span className="text-stone-700 font-semibold">Baseline</span>
            <span>→</span>
            <span className="text-stone-700 font-semibold">Stress Test</span>
            <span>→</span>
            <span className="text-stone-700 font-semibold">Understand</span>
            <span>→</span>
            <span className="text-stone-700 font-semibold">Recover</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-stone-950 tracking-tight">
              Financial Resilience Dashboard
            </h1>
            <p className="text-sm text-stone-500 mt-1 max-w-2xl leading-relaxed">
              Real-time baseline cash flow, active savings commitments, and deterministic shock resistance status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsDemoModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200/70 border border-stone-200/80 rounded-full shadow-soft-sm transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-stone-600" />
              Demo Presets
            </button>
            <Link
              href="/stress-test"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-full shadow-soft-sm transition-all active:scale-95"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Run Stress-Test
            </Link>
            <Link
              href="/goals"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-stone-900 bg-white hover:bg-stone-50 border border-stone-200/80 rounded-full shadow-soft-sm transition-all active:scale-95"
            >
              <Target className="w-3.5 h-3.5" />
              Create Goal
            </Link>
          </div>
        </div>
      </div>

      {/* Attention Required Banner */}
      {attentionRequired && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-soft-sm">
          <div className="flex items-start sm:items-center gap-3">
            <span className="p-1 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5 sm:mt-0">
              <AlertCircle className="w-4 h-4" />
            </span>
            <div className="leading-relaxed">
              <span className="font-bold">Resilience Alert: </span>
              {isOvercommitted ? (
                <span>
                  Total monthly goal commitments ({formatINR(totalMonthlyCommitment)}/mo) exceed your verified Free Cash Flow ({formatINR(freeCashFlow)}/mo).
                </span>
              ) : (
                <span>
                  {fragileGoalCount} goal{fragileGoalCount > 1 ? "s" : ""} evaluated with AT_RISK or MODERATE_RISK baseline resilience.
                </span>
              )}{" "}
              Stress-testing is recommended to assess vulnerability before shocks occur.
            </div>
          </div>
          <Link
            href="/stress-test"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200/70 font-semibold text-amber-900 transition-colors shrink-0 text-xs"
          >
            Launch Stress Test <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <Card className="p-6">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium mb-3">
            <span className="tracking-wider uppercase text-[11px] font-semibold text-stone-400">NET MONTHLY INCOME</span>
            <span className="p-1.5 rounded-lg bg-stone-100 text-stone-600">
              <Wallet className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-stone-950 tracking-tight font-mono tabular-nums">
            {formatINR(baseline?.monthly_net_income || 0)}
          </div>
          <div className="text-xs text-stone-500 mt-1.5">Take-home earnings</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium mb-3">
            <span className="tracking-wider uppercase text-[11px] font-semibold text-stone-400">FREE CASH FLOW (FCF)</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-700 tracking-tight font-mono tabular-nums">
            {formatINR(baseline?.summary?.net_free_cash_flow || 0)}
          </div>
          <div className="text-xs text-stone-500 mt-1.5">
            Capacity: <strong className="text-stone-700">{formatPercent(baseline?.summary?.savings_capacity_percent || 0)}</strong>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium mb-3">
            <span className="tracking-wider uppercase text-[11px] font-semibold text-stone-400">EMERGENCY CUSHION</span>
            <span className="p-1.5 rounded-lg bg-sky-50 text-sky-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-stone-950 tracking-tight font-mono tabular-nums">
            {formatINR(baseline?.emergency_fund_balance || 0)}
          </div>
          <div className="text-xs text-stone-500 mt-1.5">Instant liquid buffer</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium mb-3">
            <span className="tracking-wider uppercase text-[11px] font-semibold text-stone-400">ACTIVE SAVINGS GOALS</span>
            <span className="p-1.5 rounded-lg bg-stone-100 text-stone-600">
              <Target className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-stone-950 tracking-tight font-mono tabular-nums">
            {goals.length} <span className="text-sm font-sans font-normal text-stone-500">Goals</span>
          </div>
          <div className="text-xs text-stone-500 mt-1.5">Monitored for resilience</div>
        </Card>
      </div>

      {/* Main Grid: Goals & Financial Baseline Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Goals List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 sm:p-8">
            <CardHeader
              title="Active Savings Goals"
              subtitle="Goals evaluated against cashflow viability and monthly commitment"
              action={
                <Link
                  href="/goals"
                  className="text-xs font-semibold text-stone-900 hover:text-emerald-700 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-stone-200 hover:border-stone-300 transition-colors"
                >
                  Manage Goals <ArrowRight className="w-3 h-3" />
                </Link>
              }
            />

            {goals.length === 0 ? (
              <div className="py-14 text-center">
                <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3.5">
                  <Target className="w-6 h-6" />
                </div>
                <p className="text-base font-semibold text-stone-900 tracking-tight">No savings goals registered yet</p>
                <p className="text-xs text-stone-500 mt-1 mb-5 max-w-sm mx-auto leading-relaxed">
                  Set up your first financial target or load verified Indian demo scenarios with one click.
                </p>
                <div className="flex items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsDemoModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200/70 border border-stone-200/80 rounded-full shadow-soft-sm transition-all active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-stone-600" />
                    Load Demo Scenarios
                  </button>
                  <Link
                    href="/goals"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-full shadow-soft-sm transition-all active:scale-95"
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
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h4 className="font-semibold text-sm text-stone-950 tracking-tight">{g.name}</h4>
                          <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-mono font-medium border border-stone-200/60">
                            {g.category}
                          </span>
                          <span className="text-xs font-medium text-stone-500">
                            {g.target_months} mos
                          </span>
                          {gHealth && (
                            <Badge grade={gHealth.health_status} className="text-[10px]" />
                          )}
                        </div>

                        <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden mt-2">
                          <div
                            className="bg-emerald-600 h-1.5 rounded-full transition-all"
                            style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-stone-500 pt-0.5">
                          <span>Accumulated: <strong className="text-stone-700 font-mono">{formatINR(g.current_balance)}</strong></span>
                          <span>Target: <strong className="text-stone-700 font-mono">{formatINR(g.target_amount)}</strong> ({progressPct.toFixed(0)}%)</span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 gap-2 shrink-0">
                        <div className="text-right">
                          <div className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider">Required Monthly</div>
                          <div className="font-bold text-base text-stone-950 font-mono tabular-nums">
                            {formatINR(g.monthly_contribution || 0)}/mo
                          </div>
                        </div>
                        <Link
                          href={`/stress-test`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100/70 border border-rose-200/70 px-3 py-1 rounded-full transition-colors"
                        >
                          Stress-Test <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Quick Flow Navigation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/stress-test" className="block group">
              <Card className="hover:border-stone-400 hover:shadow-card-hover transition-all p-5">
                <span className="p-2 rounded-xl bg-rose-50 text-rose-600 inline-block mb-3 group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-4 h-4" />
                </span>
                <h4 className="font-semibold text-sm text-stone-950 tracking-tight">Stress-Test Lab</h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Test job disruption, medical costs, or compound cascades.
                </p>
              </Card>
            </Link>

            <Link href="/recovery" className="block group">
              <Card className="hover:border-stone-400 hover:shadow-card-hover transition-all p-5">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 inline-block mb-3 group-hover:scale-105 transition-transform">
                  <RefreshCw className="w-4 h-4" />
                </span>
                <h4 className="font-semibold text-sm text-stone-950 tracking-tight">Recovery Planner</h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Solve 3 deterministic paths (Aggressive, Balanced, Extended).
                </p>
              </Card>
            </Link>

            <Link href="/survival" className="block group">
              <Card className="hover:border-stone-400 hover:shadow-card-hover transition-all p-5">
                <span className="p-2 rounded-xl bg-sky-50 text-sky-600 inline-block mb-3 group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <h4 className="font-semibold text-sm text-stone-950 tracking-tight">Goal Survival Map</h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Compare multi-month balance trajectories & safe zones.
                </p>
              </Card>
            </Link>
          </div>
        </div>

        {/* Right Col: Financial Baseline Summary */}
        <div className="space-y-4">
          <Card className="p-6 sm:p-7">
            <CardHeader
              title="Baseline Financial Profile"
              subtitle="Verified income, fixed, and discretionary allocation"
              action={
                <Link
                  href="/baseline"
                  className="text-xs font-semibold text-stone-900 hover:text-emerald-700 px-3 py-1 rounded-full border border-stone-200 hover:border-stone-300 transition-colors"
                >
                  Edit
                </Link>
              }
            />

            {baseline ? (
              <div className="space-y-4 text-xs">
                <div className="flex justify-between py-2.5 border-b border-stone-100">
                  <span className="text-stone-600">Fixed Obligations</span>
                  <span className="font-semibold text-stone-950 font-mono">
                    {formatINR(baseline.summary?.total_fixed_expenses || 0)}
                  </span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-stone-100">
                  <span className="text-stone-600">Discretionary Spending</span>
                  <span className="font-semibold text-stone-950 font-mono">
                    {formatINR(baseline.summary?.total_discretionary_expenses || 0)}
                  </span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-stone-100">
                  <span className="text-stone-600">Debt Commitments</span>
                  <span className="font-semibold text-stone-950 font-mono">
                    {formatINR(baseline.summary?.total_debt_payments || 0)}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-stone-100 font-medium">
                  <span className="text-stone-950 font-semibold">Net Free Cash Flow</span>
                  <span className="text-emerald-700 font-bold font-mono text-sm">
                    {formatINR(baseline.summary?.net_free_cash_flow || 0)}
                  </span>
                </div>

                <div className="pt-2">
                  <div className="text-xs text-stone-500 mb-2">Savings Margin Capacity</div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, (baseline.summary?.savings_capacity_percent || 0) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-stone-400 mt-1.5">
                    <span>Target Range: 20-30%</span>
                    <span className="font-mono font-medium text-stone-700">
                      {formatPercent(baseline.summary?.savings_capacity_percent || 0)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                  <span>Standard: Indian Rupee (INR / ₹)</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Engine Verified
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-stone-500 space-y-3">
                <p>No financial baseline profile found.</p>
                <Link
                  href="/baseline"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-full text-xs font-semibold hover:bg-stone-800 transition-colors shadow-soft-sm"
                >
                  Configure Baseline Profile <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
