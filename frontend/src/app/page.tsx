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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Resilience Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time baseline cash flow, active savings goals, and shock resistance status.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsDemoModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 rounded-lg shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Demo Presets
          </button>
          <Link
            href="/stress-test"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Run Stress-Test
          </Link>
          <Link
            href="/goals"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition-colors"
          >
            <Target className="w-3.5 h-3.5" />
            Create Goal
          </Link>
        </div>
      </div>

      {/* Attention Required Banner */}
      {attentionRequired && (
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-300/80 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-bold">Resilience Alert: </span>
              {isOvercommitted ? (
                <span>
                  Total monthly goal commitments ({formatINR(totalMonthlyCommitment)}/mo) exceed your verified Free Cash Flow ({formatINR(freeCashFlow)}/mo).
                </span>
              ) : (
                <span>
                  {fragileGoalCount} goal{fragileGoalCount > 1 ? "s" : ""} evaluated with VULNERABLE or CRITICAL baseline resilience.
                </span>
              )}{" "}
              Stress-testing is recommended to assess vulnerability before shocks occur.
            </div>
          </div>
          <Link
            href="/stress-test"
            className="inline-flex items-center gap-1 font-bold text-amber-950 underline hover:no-underline shrink-0 text-xs"
          >
            Launch Stress Test →
          </Link>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
            <span>NET MONTHLY INCOME</span>
            <Wallet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {formatINR(baseline?.monthly_net_income || 0)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Take-home earnings</div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
            <span>FREE CASH FLOW (FCF)</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {formatINR(baseline?.summary?.net_free_cash_flow || 0)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Capacity: {formatPercent(baseline?.summary?.savings_capacity_percent || 0)}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
            <span>EMERGENCY CUSHION</span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {formatINR(baseline?.emergency_fund_balance || 0)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Instant liquid buffer</div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
            <span>ACTIVE SAVINGS GOALS</span>
            <Target className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900">{goals.length} Goals</div>
          <div className="text-xs text-slate-500 mt-1">Monitored for resilience</div>
        </Card>
      </div>

      {/* Main Grid: Goals & Financial Baseline Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Goals List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader
              title="Active Savings Goals"
              subtitle="Goals evaluated against cashflow viability and monthly commitment"
              action={
                <Link
                  href="/goals"
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                >
                  Manage Goals <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
            />

            {goals.length === 0 ? (
              <div className="py-12 text-center">
                <Target className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-700">No savings goals registered yet</p>
                <p className="text-xs text-slate-500 mt-1 mb-4 max-w-sm mx-auto">
                  Set up your first financial target or load verified Indian demo scenarios with one click.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDemoModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Load Demo Scenarios
                  </button>
                  <Link
                    href="/goals"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Create Custom Goal
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {goals.map((g) => {
                  const progressPct = g.target_amount > 0 ? (g.current_balance / g.target_amount) * 100 : 0;
                  const gHealth = goalHealthMap[g.id];

                  return (
                    <div key={g.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-sm text-slate-900">{g.name}</h4>
                          <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                            {g.category}
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            {g.target_months} mos
                          </span>
                          {gHealth && (
                            <Badge grade={gHealth.health_status} className="text-[10px]" />
                          )}
                        </div>

                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-1.5">
                          <div
                            className="bg-emerald-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 pt-0.5">
                          <span>Accumulated: {formatINR(g.current_balance)}</span>
                          <span>Target: {formatINR(g.target_amount)} ({progressPct.toFixed(0)}%)</span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 gap-2 shrink-0">
                        <div className="text-right">
                          <div className="text-[11px] text-slate-500">Required Monthly</div>
                          <div className="font-bold text-sm text-slate-900">
                            {formatINR(g.monthly_contribution || 0)}/mo
                          </div>
                        </div>
                        <Link
                          href={`/stress-test`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-md transition-colors"
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
            <Link href="/stress-test" className="block">
              <Card className="hover:border-slate-300 transition-colors p-4">
                <ShieldAlert className="w-5 h-5 text-rose-600 mb-2" />
                <h4 className="font-semibold text-sm text-slate-900">Stress-Test Lab</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Test job disruption, medical costs, or compound cascades.
                </p>
              </Card>
            </Link>

            <Link href="/recovery" className="block">
              <Card className="hover:border-slate-300 transition-colors p-4">
                <RefreshCw className="w-5 h-5 text-emerald-600 mb-2" />
                <h4 className="font-semibold text-sm text-slate-900">Recovery Planner</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Solve 3 deterministic paths (Aggressive, Balanced, Extended).
                </p>
              </Card>
            </Link>

            <Link href="/survival" className="block">
              <Card className="hover:border-slate-300 transition-colors p-4">
                <TrendingUp className="w-5 h-5 text-blue-600 mb-2" />
                <h4 className="font-semibold text-sm text-slate-900">Goal Survival Map</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Compare multi-month balance trajectories & safe zones.
                </p>
              </Card>
            </Link>
          </div>
        </div>

        {/* Right Col: Financial Baseline Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Baseline Financial Profile"
              subtitle="Verified income, fixed, and discretionary allocation"
              action={
                <Link
                  href="/baseline"
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Edit
                </Link>
              }
            />

            {baseline ? (
              <div className="space-y-4 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Fixed Obligations</span>
                  <span className="font-semibold text-slate-900">
                    {formatINR(baseline.summary?.total_fixed_expenses || 0)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Discretionary Spending</span>
                  <span className="font-semibold text-slate-900">
                    {formatINR(baseline.summary?.total_discretionary_expenses || 0)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Debt Commitments</span>
                  <span className="font-semibold text-slate-900">
                    {formatINR(baseline.summary?.total_debt_payments || 0)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 font-medium">
                  <span className="text-slate-900">Net Free Cash Flow</span>
                  <span className="text-emerald-600 font-bold">
                    {formatINR(baseline.summary?.net_free_cash_flow || 0)}
                  </span>
                </div>

                <div className="pt-2">
                  <div className="text-xs text-slate-500 mb-1">Savings Margin Capacity</div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, Math.max(0, baseline.summary?.savings_capacity_percent || 0))}%`,
                      }}
                    />
                  </div>
                  <div className="text-right text-slate-500 text-[11px] mt-1">
                    {formatPercent(baseline.summary?.savings_capacity_percent || 0)} of income
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                <p>No baseline profile registered yet.</p>
                <Link
                  href="/baseline"
                  className="mt-2 inline-block text-emerald-600 font-medium hover:underline"
                >
                  Configure Baseline Now →
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
