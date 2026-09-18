"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { Goal, ShockEvent, ShockType, SimulationResult } from "@/types/api";
import { formatINR } from "@/lib/utils";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SurvivalChart } from "@/components/charts/SurvivalChart";
import { ResilienceFingerprint } from "@/components/ui/ResilienceFingerprint";
import { AssumptionLedger } from "@/components/ui/AssumptionLedger";
import { AIExplanationCard } from "@/components/ui/AIExplanationCard";
import {
  ShieldAlert,
  Play,
  Plus,
  Trash2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Calendar,
  AlertCircle,
  RefreshCw,
  GitCommit,
  HelpCircle,
  Zap,
  Activity,
} from "lucide-react";

export default function StressTestPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [mode, setMode] = useState<"single" | "cascade">("single");

  // Single Shock State
  const [singleShock, setSingleShock] = useState<ShockEvent>({
    shock_type: "income_drop",
    start_month: 3,
    duration_months: 4,
    magnitude_percent: 0.35,
    amount: 0,
    description: "Salary Reduction / Project Pause",
  });

  // Cascade Shocks State
  const [cascadeShocks, setCascadeShocks] = useState<ShockEvent[]>([
    {
      shock_type: "income_drop",
      start_month: 2,
      duration_months: 3,
      magnitude_percent: 0.40,
      description: "Job Furlough / Income Gap",
    },
    {
      shock_type: "lump_sum_expense",
      start_month: 4,
      amount: 150000,
      description: "Emergency Medical Expenses",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getGoals()
      .then((data) => {
        setGoals(data);
        if (data.length > 0) setSelectedGoalId(data[0].id);
      })
      .catch(() => {});
  }, []);

  async function handleRunSimulation() {
    if (!selectedGoalId) {
      alert("Please select a savings goal first.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let res: SimulationResult;
      if (mode === "single") {
        res = await api.simulateSingleShock(selectedGoalId, singleShock, 36);
      } else {
        res = await api.simulateCascade(selectedGoalId, "Custom Cascade Crisis", cascadeShocks, 36);
      }
      setSimResult(res);
    } catch (err: any) {
      setError(err.message || "Simulation failed to execute.");
    } finally {
      setLoading(false);
    }
  }

  function addCascadeShock() {
    setCascadeShocks([
      ...cascadeShocks,
      {
        shock_type: "lump_sum_expense",
        start_month: 5,
        amount: 50000,
        description: "Unexpected Home Repair",
      },
    ]);
  }

  function removeCascadeShock(index: number) {
    const updated = [...cascadeShocks];
    updated.splice(index, 1);
    setCascadeShocks(updated);
  }

  const selectedGoal = goals.find((g) => g.id === selectedGoalId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Stress-Test Lab & Cascade Sequencer</h1>
        <p className="text-sm text-slate-500 mt-1">
          Subject your goal to realistic income disruptions, emergency medical bills, inflation, and cascading crises.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Goal & Mode Selection Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">TARGET GOAL:</label>
            <select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              className="text-xs font-medium px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-emerald-500 flex-1 sm:w-64"
            >
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({formatINR(g.target_amount)})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-stretch sm:self-auto text-xs font-medium">
            <button
              onClick={() => setMode("single")}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md transition-colors ${
                mode === "single" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Single Shock
            </button>
            <button
              onClick={() => setMode("cascade")}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md transition-colors ${
                mode === "cascade" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Cascade Mode (Multi-Shock)
            </button>
          </div>
        </div>
      </Card>

      {/* Main Grid: Controls + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Shock Configuration */}
        <div className="space-y-6">
          <Card className="p-5">
            <CardHeader
              title={mode === "single" ? "Single Shock Setup" : "Cascade Event Sequencer"}
              subtitle="Configure macroeconomic & personal financial shocks"
            />

            {mode === "single" ? (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Shock Category</label>
                  <select
                    value={singleShock.shock_type}
                    onChange={(e) =>
                      setSingleShock({ ...singleShock, shock_type: e.target.value as ShockType })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="income_drop">Income Reduction (Job loss, furlough)</option>
                    <option value="lump_sum_expense">Lump Sum Outflow (Medical, home repair)</option>
                    <option value="inflation_spike">Inflation Spike (General cost rise)</option>
                    <option value="interest_rate_hike">Interest Rate Hike (EMI jump)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Start Month</label>
                    <input
                      type="number"
                      min="1"
                      value={singleShock.start_month}
                      onChange={(e) =>
                        setSingleShock({ ...singleShock, start_month: parseInt(e.target.value) || 1 })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>

                  {singleShock.shock_type !== "lump_sum_expense" && (
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Duration (Months)</label>
                      <input
                        type="number"
                        min="1"
                        value={singleShock.duration_months}
                        onChange={(e) =>
                          setSingleShock({ ...singleShock, duration_months: parseInt(e.target.value) || 1 })
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                  )}
                </div>

                {singleShock.shock_type === "lump_sum_expense" ? (
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Expense Outflow (₹)</label>
                    <input
                      type="number"
                      step="5000"
                      value={singleShock.amount}
                      onChange={(e) =>
                        setSingleShock({ ...singleShock, amount: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Magnitude Impact: {((singleShock.magnitude_percent || 0) * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      min="0.05"
                      max="1.0"
                      step="0.05"
                      value={singleShock.magnitude_percent}
                      onChange={(e) =>
                        setSingleShock({ ...singleShock, magnitude_percent: parseFloat(e.target.value) })
                      }
                      className="w-full accent-emerald-600"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Description / Notes</label>
                  <input
                    type="text"
                    value={singleShock.description}
                    onChange={(e) => setSingleShock({ ...singleShock, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    placeholder="e.g. Furlough or Medical co-pay"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-700">Cascade Sequence Events</span>
                  <button
                    type="button"
                    onClick={addCascadeShock}
                    className="inline-flex items-center gap-1 text-emerald-600 font-medium hover:underline text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Shock
                  </button>
                </div>

                <div className="space-y-3">
                  {cascadeShocks.map((s, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800">Event #{idx + 1}</span>
                        {cascadeShocks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCascadeShock(idx)}
                            className="text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] text-slate-500">Type</label>
                          <select
                            value={s.shock_type}
                            onChange={(e) => {
                              const updated = [...cascadeShocks];
                              updated[idx].shock_type = e.target.value as ShockType;
                              setCascadeShocks(updated);
                            }}
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-white"
                          >
                            <option value="income_drop">Income Drop</option>
                            <option value="lump_sum_expense">Lump Sum Cost</option>
                            <option value="inflation_spike">Inflation</option>
                            <option value="interest_rate_hike">Rate Hike</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-500">Start Month</label>
                          <input
                            type="number"
                            min="1"
                            value={s.start_month}
                            onChange={(e) => {
                              const updated = [...cascadeShocks];
                              updated[idx].start_month = parseInt(e.target.value) || 1;
                              setCascadeShocks(updated);
                            }}
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-white"
                          />
                        </div>
                      </div>

                      {s.shock_type === "lump_sum_expense" ? (
                        <div>
                          <label className="block text-[11px] text-slate-500">Amount (₹)</label>
                          <input
                            type="number"
                            step="5000"
                            value={s.amount}
                            onChange={(e) => {
                              const updated = [...cascadeShocks];
                              updated[idx].amount = parseFloat(e.target.value) || 0;
                              setCascadeShocks(updated);
                            }}
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-white font-mono"
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] text-slate-500">Magnitude (0-1)</label>
                            <input
                              type="number"
                              step="0.05"
                              value={s.magnitude_percent}
                              onChange={(e) => {
                                const updated = [...cascadeShocks];
                                updated[idx].magnitude_percent = parseFloat(e.target.value) || 0;
                                setCascadeShocks(updated);
                              }}
                              className="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-500">Duration (Mo)</label>
                            <input
                              type="number"
                              min="1"
                              value={s.duration_months}
                              onChange={(e) => {
                                const updated = [...cascadeShocks];
                                updated[idx].duration_months = parseInt(e.target.value) || 1;
                                setCascadeShocks(updated);
                              }}
                              className="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={handleRunSimulation}
                disabled={loading || !selectedGoalId}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg shadow-sm transition-colors text-xs disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {loading ? "Running Math Engine..." : "Execute Stress Test"}
              </button>
            </div>
          </Card>
        </div>

        {/* Right 2 Cols: Simulation Results & Visualizer */}
        <div className="lg:col-span-2 space-y-6">
          {simResult ? (
            <>
              {/* Top Result Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="p-4">
                  <div className="text-slate-500 text-xs font-medium">RESILIENCE SCORE</div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    {simResult.resilience_score}/100
                  </div>
                  <Badge grade={simResult.resilience_grade} className="mt-2" />
                </Card>

                <Card className="p-4">
                  <div className="text-slate-500 text-xs font-medium">DEADLINE SLIPPAGE</div>
                  <div className="text-2xl font-bold text-amber-600 mt-1">
                    +{simResult.stressed.slippage_months} Mos
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Finished at M{simResult.stressed.completion_month || 36}
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="text-slate-500 text-xs font-medium">CAPITAL SHORTFALL</div>
                  <div className="text-2xl font-bold text-rose-600 mt-1">
                    {formatINR(simResult.stressed.capital_deficit)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">At initial deadline</div>
                </Card>

                <Card className="p-4">
                  <div className="text-slate-500 text-xs font-medium">MINIMUM LIQUIDITY</div>
                  <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                    {formatINR(simResult.stressed.minimum_cash_buffer)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {simResult.stressed.buffer_exhausted ? "Buffer Depleted" : "Buffer Preserved"}
                  </div>
                </Card>
              </div>

              {/* Insolvency Warning Card */}
              {simResult.cascade_triggered_insolvency && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-sm text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Critical Insolvency Triggered!
                  </div>
                  <p>
                    Emergency cushion was fully exhausted in Month {simResult.insolvency_first_month}. Peak cashflow deficit reached {formatINR(simResult.peak_deficit)}. Immediate recovery planning is required to avoid default.
                  </p>
                </div>
              )}

              {/* Interactive Recharts Trajectory */}
              <Card>
                <CardHeader
                  title="Goal Trajectory: Baseline vs. Stressed Simulation"
                  subtitle="Monthly cumulative goal balance projection in INR (₹)"
                  action={
                    <Link
                      href="/recovery"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors"
                    >
                      Compare Recovery Plans <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  }
                />

                <SurvivalChart
                  baselineCurve={simResult.monthly_timeline.map((t) => t.baseline_balance)}
                  stressedCurve={simResult.monthly_timeline.map((t) => t.stressed_balance)}
                  targetAmount={selectedGoal?.target_amount}
                  targetDeadlineMonths={selectedGoal?.target_months}
                />
              </Card>

              {/* AI Explanation Layer */}
              <AIExplanationCard
                goalId={selectedGoalId}
                explanationType={mode === "cascade" ? "cascade" : "stress_test"}
                shocks={mode === "cascade" ? cascadeShocks : [singleShock]}
                horizonMonths={36}
                title={mode === "cascade" ? "AI Cascade Analysis: Why Multi-Shocks Compound" : "AI Stress-Test Analysis: Impact & Drivers"}
              />

              {/* CASCADE MODE: Financial Chain Reaction Visualization */}
              {simResult.chain_reaction_steps && simResult.chain_reaction_steps.length > 0 && (
                <Card className="p-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <h3 className="font-bold text-slate-900 text-sm">
                          Financial Chain Reaction (Cascade Breakdown)
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Step-by-step mathematical transmission explaining how compounded shocks erode goal solvency
                      </p>
                    </div>
                    <span className="text-xs font-mono font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">
                      {simResult.chain_reaction_steps.length} Sequenced Steps
                    </span>
                  </div>

                  <div className="space-y-3">
                    {simResult.chain_reaction_steps.map((step) => (
                      <div
                        key={step.step_number}
                        className={`p-3.5 rounded-lg border text-xs transition-all ${
                          step.is_critical
                            ? "border-rose-300 bg-rose-50/50"
                            : "border-slate-200 bg-slate-50/40"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                              step.is_critical ? "bg-rose-600 text-white" : "bg-slate-800 text-white"
                            }`}>
                              {step.step_number}
                            </span>
                            <span className="font-bold text-slate-900 text-xs">{step.title}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-200 text-slate-700">
                              {step.timing}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px]">
                            <span className="text-slate-500">
                              Buffer: <span className="font-mono font-semibold text-slate-800">{formatINR(step.remaining_buffer)}</span>
                            </span>
                            {step.cumulative_delay_added > 0 && (
                              <span className="text-amber-600 font-semibold">
                                +{step.cumulative_delay_added} mo delay
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-slate-600 leading-relaxed mb-2">
                          {step.goal_impact_description}
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
                          <div>
                            <span className="text-slate-400">Monthly Cash-flow: </span>
                            <span className={`font-mono font-semibold ${step.monthly_cashflow_impact < 0 ? "text-rose-600" : "text-slate-700"}`}>
                              {step.monthly_cashflow_impact < 0 ? "-" : ""}{formatINR(Math.abs(step.monthly_cashflow_impact))}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Contribution Cut: </span>
                            <span className="font-mono font-semibold text-amber-700">
                              {formatINR(step.monthly_contribution_change)}/mo
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Disruption: </span>
                            <span className="font-medium text-slate-700 uppercase">
                              {step.shock_type.replace(/_/g, " ")}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* WHY DID MY GOAL FAIL? Root-Cause Diagnostic Card */}
              {simResult.failure_diagnostic && (
                <Card className="p-5 border-rose-200 bg-white">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <h3 className="font-bold text-slate-900 text-sm">
                          Deterministic Root-Cause Analysis: &ldquo;Why Did My Goal Fail / Become Fragile?&rdquo;
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Quantitative attribution without AI speculation — directly derived from verified engine mechanics
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      Driver: {simResult.failure_diagnostic.primary_vulnerability}
                    </span>
                  </div>

                  {/* Headline & 4-metric Summary */}
                  <div className="bg-rose-50/60 rounded-lg p-3.5 border border-rose-100 mb-4">
                    <div className="font-bold text-rose-900 text-xs mb-2">
                      {simResult.failure_diagnostic.headline}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-500">Cash-Flow Contraction</div>
                        <div className="font-bold font-mono text-rose-700">
                          {formatINR(simResult.failure_diagnostic.cashflow_drop_monthly)}/mo
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Emergency Buffer Absorbed</div>
                        <div className="font-bold font-mono text-slate-900">
                          {formatINR(simResult.failure_diagnostic.buffer_absorbed_total)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Monthly Contribution Cut</div>
                        <div className="font-bold font-mono text-amber-700">
                          {formatINR(simResult.failure_diagnostic.contribution_drop_monthly)}/mo
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Deadline Delay</div>
                        <div className="font-bold font-mono text-slate-900">
                          +{simResult.failure_diagnostic.deadline_slippage_months} Mos
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5-Step Numbered Root Causes */}
                  <div className="space-y-2 text-xs">
                    <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wide">
                      Failure Progression Sequence:
                    </div>
                    {simResult.failure_diagnostic.root_causes.map((cause, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-2 rounded bg-slate-50 text-slate-700">
                        <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{cause}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Financial Resilience Fingerprint */}
              {simResult.resilience_fingerprint && (
                <ResilienceFingerprint fingerprint={simResult.resilience_fingerprint} />
              )}

              {/* Assumption Ledger */}
              {simResult.assumption_ledger && (
                <AssumptionLedger ledger={simResult.assumption_ledger} />
              )}
            </>
          ) : (
            <Card className="py-20 text-center">
              <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-800 text-sm">Stress-Test Simulation Ready</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Configure your financial shock parameters on the left and click Execute to view mathematical impact.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
