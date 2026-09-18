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
        <div className="flex items-center gap-2 text-stone-500 text-sm">
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
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Demo Preset Modal */}
      <DemoPresetModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onSuccess={() => loadData()}
      />

      {/* Hero Section: Editorial Asymmetric Header */}
      <div className="pt-2 pb-8 border-b border-stone-200/80">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-200/50 border border-stone-300/60 text-[11px] font-display text-stone-700 tracking-wider uppercase font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 animate-pulse" />
            <span>Deterministic Financial Engine</span>
          </div>

          {/* 5-Step Process Sequence */}
          <div className="hidden md:flex items-center gap-2 text-[10px] font-display uppercase tracking-widest text-stone-400">
            <span className="text-stone-900 font-semibold">Build</span>
            <span className="text-stone-300">/</span>
            <span className="text-stone-900 font-semibold">Baseline</span>
            <span className="text-stone-300">/</span>
            <span className="text-stone-900 font-semibold">Stress Test</span>
            <span className="text-stone-300">/</span>
            <span className="text-stone-900 font-semibold">Understand</span>
            <span className="text-stone-300">/</span>
            <span className="text-stone-900 font-semibold">Recover</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8 space-y-3">
            <h1 className="font-serif italic text-4xl sm:text-5xl lg:text-6xl text-stone-950 leading-[1.08] tracking-tight">
              Stress-test your financial goals <br className="hidden sm:inline" />
              <span className="not-italic font-display font-medium text-stone-900 text-3xl sm:text-4xl lg:text-5xl">
                before you commit.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-stone-600 max-w-2xl font-sans leading-relaxed pt-1">
              SaveSmart verifies capital durability against job loss, medical emergencies, and compounding inflation before reality tests them for you.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-wrap lg:justify-end items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsDemoModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-display font-semibold text-stone-900 bg-stone-200/60 hover:bg-stone-200 border border-stone-300/70 rounded-full transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5 text-stone-700" />
              Demo Presets
            </button>
            <Link
              href="/stress-test"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-display font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-full shadow-soft-sm transition-all active:scale-[0.98]"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Run Stress-Test
            </Link>
            <Link
              href="/goals"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-display font-semibold text-stone-900 bg-white hover:bg-stone-50 border border-stone-300/70 rounded-full shadow-soft-sm transition-all active:scale-[0.98]"
            >
              <Target className="w-3.5 h-3.5" />
              Create Goal
            </Link>
          </div>
        </div>
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
                  Total monthly goal commitments (<strong className="tabular-nums font-semibold">{formatINR(totalMonthlyCommitment)}</strong>/mo) exceed verified Free Cash Flow (<strong className="tabular-nums font-semibold">{formatINR(freeCashFlow)}</strong>/mo).
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
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-900 text-amber-50 hover:bg-amber-950 font-display font-semibold transition-colors shrink-0 text-xs"
          >
            Launch Stress Test <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Signature Financial Status Masthead: De-boxed & Striking */}
      <div className="rounded-3xl bg-white border border-stone-200/80 p-8 sm:p-10 shadow-soft-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Main FCF Focus: Oversized Figure */}
          <div className="lg:col-span-5 space-y-3 lg:border-r lg:border-stone-200/80 lg:pr-8">
            <div className="flex items-center gap-2 text-[11px] font-display font-bold uppercase tracking-widest text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>Net Free Cash Flow (FCF)</span>
            </div>
            <div className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-stone-950 tracking-tighter tabular-nums">
              {formatINR(baseline?.summary?.net_free_cash_flow || 0)}
            </div>
            <p className="text-xs text-stone-500 leading-relaxed max-w-sm">
              True liquid discretionary capacity each month after funding all non-negotiable living expenses and debt payments.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs">
              <span className="font-display font-semibold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
                Capacity: {formatPercent(baseline?.summary?.savings_capacity_percent || 0)}
              </span>
              <span className="text-stone-400 text-[11px]">Target: 20-30%</span>
            </div>
          </div>

          {/* Supporting 3 Oversized Metric Columns */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="space-y-1">
              <div className="text-[11px] font-display font-bold uppercase tracking-wider text-stone-400">
                Net Monthly Income
              </div>
              <div className="text-2xl sm:text-3xl font-display font-bold text-stone-950 tracking-tight tabular-nums">
                {formatINR(baseline?.monthly_net_income || 0)}
              </div>
              <p className="text-[11px] text-stone-500 pt-1">Take-home earnings in INR</p>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-display font-bold uppercase tracking-wider text-stone-400">
                Emergency Cushion
              </div>
              <div className="text-2xl sm:text-3xl font-display font-bold text-stone-950 tracking-tight tabular-nums">
                {formatINR(baseline?.emergency_fund_balance || 0)}
              </div>
              <p className="text-[11px] text-stone-500 pt-1">Instant liquid reserves</p>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-display font-bold uppercase tracking-wider text-stone-400">
                Active Savings Goals
              </div>
              <div className="text-2xl sm:text-3xl font-display font-bold text-stone-950 tracking-tight tabular-nums">
                {goals.length} <span className="text-xs font-sans font-normal text-stone-400">Targets</span>
              </div>
              <p className="text-[11px] text-stone-500 pt-1">Monitored for resilience</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Goals & Financial Baseline Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7-8 Cols: Goals List */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-soft-sm">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-5 border-b border-stone-100 mb-5">
              <div>
                <h3 className="font-serif italic text-2xl sm:text-3xl text-stone-950">Active Savings Goals</h3>
                <p className="text-xs text-stone-500 mt-1">Goals evaluated against cashflow viability and monthly commitment</p>
              </div>
              <Link
                href="/goals"
                className="text-xs font-display font-semibold text-stone-900 hover:text-emerald-800 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200/80 transition-colors shrink-0"
              >
                Manage Goals <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

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
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-display font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200/70 border border-stone-200/80 rounded-full shadow-soft-sm transition-all active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-stone-600" />
                    Load Demo Scenarios
                  </button>
                  <Link
                    href="/goals"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-display font-semibold text-white bg-stone-900 hover:bg-black rounded-full shadow-soft-sm transition-all active:scale-95"
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
                    <div key={g.id} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h4 className="font-display font-semibold text-base text-stone-950 tracking-tight">{g.name}</h4>
                          <span className="text-[10px] uppercase px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-display font-semibold border border-stone-200">
                            {g.category}
                          </span>
                          <span className="text-xs font-medium text-stone-500">
                            {g.target_months} mos
                          </span>
                          {gHealth && (
                            <Badge grade={gHealth.health_status} className="text-[10px]" />
                          )}
                        </div>

                        <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden mt-3">
                          <div
                            className="bg-emerald-700 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-stone-500 pt-1 tabular-nums">
                          <span>Accumulated: <strong className="text-stone-800 font-semibold">{formatINR(g.current_balance)}</strong></span>
                          <span>Target: <strong className="text-stone-800 font-semibold">{formatINR(g.target_amount)}</strong> ({progressPct.toFixed(0)}%)</span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 gap-2 shrink-0">
                        <div className="text-right">
                          <div className="text-[10px] uppercase font-display font-semibold text-stone-400 tracking-wider">Required Monthly</div>
                          <div className="font-display font-bold text-lg text-stone-950 tabular-nums">
                            {formatINR(g.monthly_contribution || 0)}/mo
                          </div>
                        </div>
                        <Link
                          href={`/stress-test`}
                          className="inline-flex items-center gap-1.5 text-xs font-display font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200/80 px-3.5 py-1.5 rounded-full transition-colors"
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

          {/* Quick Flow Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/stress-test" className="block group">
              <div className="rounded-2xl border border-stone-200/80 bg-white hover:border-stone-400 transition-all p-5 shadow-soft-sm">
                <span className="p-2.5 rounded-xl bg-stone-100 text-rose-700 inline-block mb-3 group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-4 h-4" />
                </span>
                <h4 className="font-display font-semibold text-sm text-stone-950 tracking-tight">Stress-Test Lab</h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Test job disruption, medical costs, or compound cascades.
                </p>
              </div>
            </Link>

            <Link href="/recovery" className="block group">
              <div className="rounded-2xl border border-stone-200/80 bg-white hover:border-stone-400 transition-all p-5 shadow-soft-sm">
                <span className="p-2.5 rounded-xl bg-stone-100 text-emerald-800 inline-block mb-3 group-hover:scale-105 transition-transform">
                  <RefreshCw className="w-4 h-4" />
                </span>
                <h4 className="font-display font-semibold text-sm text-stone-950 tracking-tight">Recovery Planner</h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Solve 3 deterministic paths (Aggressive, Balanced, Extended).
                </p>
              </div>
            </Link>

            <Link href="/survival" className="block group">
              <div className="rounded-2xl border border-stone-200/80 bg-white hover:border-stone-400 transition-all p-5 shadow-soft-sm">
                <span className="p-2.5 rounded-xl bg-stone-100 text-stone-800 inline-block mb-3 group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <h4 className="font-display font-semibold text-sm text-stone-950 tracking-tight">Goal Survival Map</h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Compare multi-month balance trajectories & safe zones.
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Right Col: Financial Baseline Summary */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-24">
          <div className="rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-7 shadow-soft-sm">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <div>
                <h3 className="font-display font-semibold text-base text-stone-950 tracking-tight">Baseline Profile</h3>
                <p className="text-xs text-stone-500">Verified cash flow allocation</p>
              </div>
              <Link
                href="/baseline"
                className="text-xs font-display font-semibold text-stone-900 hover:text-emerald-800 px-3 py-1 rounded-full bg-stone-100 hover:bg-stone-200/80 transition-colors"
              >
                Edit
              </Link>
            </div>

            {baseline ? (
              <div className="space-y-4 text-xs">
                <div className="flex justify-between py-2.5 border-b border-stone-100">
                  <span className="text-stone-500">Fixed Obligations</span>
                  <span className="font-semibold text-stone-950 tabular-nums font-display">
                    {formatINR(baseline.summary?.total_fixed_expenses || 0)}
                  </span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-stone-100">
                  <span className="text-stone-500">Discretionary Spending</span>
                  <span className="font-semibold text-stone-950 tabular-nums font-display">
                    {formatINR(baseline.summary?.total_discretionary_expenses || 0)}
                  </span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-stone-100">
                  <span className="text-stone-500">Debt Commitments</span>
                  <span className="font-semibold text-stone-950 tabular-nums font-display">
                    {formatINR(baseline.summary?.total_debt_payments || 0)}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-stone-100 font-medium">
                  <span className="text-stone-950 font-semibold">Net Free Cash Flow</span>
                  <span className="text-emerald-800 font-bold font-display text-sm tabular-nums">
                    {formatINR(baseline.summary?.net_free_cash_flow || 0)}
                  </span>
                </div>

                <div className="pt-2">
                  <div className="text-xs text-stone-500 mb-2">Savings Margin Capacity</div>
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
                  <div className="flex justify-between text-[11px] text-stone-400 mt-1.5 tabular-nums">
                    <span>Target Range: 20-30%</span>
                    <span className="font-display font-medium text-stone-700">
                      {formatPercent(baseline.summary?.savings_capacity_percent || 0)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                  <span>Standard: Indian Rupee (INR / ₹)</span>
                  <span className="inline-flex items-center gap-1 text-emerald-800 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Engine Verified
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-stone-500 space-y-3">
                <p>No financial baseline profile found.</p>
                <Link
                  href="/baseline"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-full text-xs font-semibold hover:bg-black transition-colors shadow-soft-sm"
                >
                  Configure Baseline Profile <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
