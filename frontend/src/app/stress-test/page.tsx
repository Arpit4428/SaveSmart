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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-stone-100 border border-stone-200/60 text-[11px] font-medium text-stone-600 mb-2">
            <span>Step 3 of 5</span>
            <span className="text-stone-300">•</span>
            <span>Disruption Simulation</span>
          </div>
          <h1 className="text-3xl font-semibold text-stone-950 tracking-tight">Stress-Test Lab & Cascade Sequencer</h1>
          <p className="text-sm text-stone-500 mt-1 max-w-2xl">
            Subject your goal to realistic income disruptions, emergency medical bills, inflation, and cascading crises deterministically.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-sm flex items-center gap-2.5 shadow-soft-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Goal & Mode Selection Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-xs font-semibold text-stone-700 tracking-wider uppercase whitespace-nowrap">TARGET GOAL:</label>
            <select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              className="text-xs font-medium px-3.5 py-2 border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 flex-1 sm:w-72 transition-all"
            >
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({formatINR(g.target_amount)})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-full self-stretch sm:self-auto text-xs font-medium border border-stone-200/60">
            <button
              onClick={() => setMode("single")}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-full transition-all text-xs font-medium ${
                mode === "single" ? "bg-white text-stone-950 shadow-soft-sm" : "text-stone-600 hover:text-stone-950"
              }`}
            >
              Single Shock
            </button>
            <button
              onClick={() => setMode("cascade")}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-full transition-all text-xs font-medium ${
                mode === "cascade" ? "bg-white text-stone-950 shadow-soft-sm" : "text-stone-600 hover:text-stone-950"
              }`}
            >
              Cascade Mode (Multi-Shock)
            </button>
          </div>
        </div>
      </Card>

      {/* Main Grid: Controls + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Shock Configuration */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-24 space-y-6">
          <Card>
            <CardHeader
              title={mode === "single" ? "Single Shock Setup" : "Cascade Event Sequencer"}
              subtitle="Configure macroeconomic & personal financial shocks"
            />

            {mode === "single" ? (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-stone-700 mb-1.5">Shock Category</label>
                  <select
                    value={singleShock.shock_type}
                    onChange={(e) =>
                      setSingleShock({ ...singleShock, shock_type: e.target.value as ShockType })
                    }
                    className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:bg-white transition-all text-xs"
                  >
                    <option value="income_drop">Income Reduction (Job loss, furlough)</option>
                    <option value="lump_sum_expense">Lump Sum Outflow (Medical, home repair)</option>
                    <option value="inflation_spike">Inflation Spike (General cost rise)</option>
                    <option value="interest_rate_hike">Interest Rate Hike (EMI jump)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-stone-700 mb-1.5">Start Month</label>
                    <input
                      type="number"
                      min="1"
                      value={singleShock.start_month}
                      onChange={(e) =>
                        setSingleShock({ ...singleShock, start_month: parseInt(e.target.value) || 1 })
                      }
                      className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:bg-white transition-all text-xs"
                    />
                  </div>

                  {singleShock.shock_type !== "lump_sum_expense" && (
                    <div>
                      <label className="block font-medium text-stone-700 mb-1.5">Duration (Months)</label>
                      <input
                        type="number"
                        min="1"
                        value={singleShock.duration_months}
                        onChange={(e) =>
                          setSingleShock({ ...singleShock, duration_months: parseInt(e.target.value) || 1 })
                        }
                        className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:bg-white transition-all text-xs"
                      />
                    </div>
                  )}
                </div>

                {singleShock.shock_type === "lump_sum_expense" ? (
                  <div>
                    <label className="block font-medium text-stone-700 mb-1.5">Expense Outflow (₹)</label>
                    <input
                      type="number"
                      step="5000"
                      value={singleShock.amount}
                      onChange={(e) =>
                        setSingleShock({ ...singleShock, amount: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:bg-white transition-all text-xs"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-medium text-stone-700 mb-1.5">
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
                      className="w-full accent-stone-900 cursor-pointer"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-medium text-stone-700 mb-1.5">Description / Notes</label>
                  <input
                    type="text"
                    value={singleShock.description}
                    onChange={(e) => setSingleShock({ ...singleShock, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:bg-white transition-all text-xs"
                    placeholder="e.g. Furlough or Medical co-pay"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-stone-900">Cascade Sequence Events</span>
                  <button
                    type="button"
                    onClick={addCascadeShock}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-stone-700" /> Add Shock
                  </button>
                </div>

                <div className="space-y-3">
                  {cascadeShocks.map((s, idx) => (
                    <div key={idx} className="p-3.5 bg-stone-50/70 border border-stone-200/80 rounded-xl space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-stone-900">Event #{idx + 1}</span>
                        {cascadeShocks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCascadeShock(idx)}
                            className="text-stone-400 hover:text-rose-600 p-1 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] text-stone-500 mb-1">Type</label>
                          <select
                            value={s.shock_type}
                            onChange={(e) => {
                              const updated = [...cascadeShocks];
                              updated[idx].shock_type = e.target.value as ShockType;
                              setCascadeShocks(updated);
                            }}
                            className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                          >
                            <option value="income_drop">Income Drop</option>
                            <option value="lump_sum_expense">Lump Sum Cost</option>
                            <option value="inflation_spike">Inflation</option>
                            <option value="interest_rate_hike">Rate Hike</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] text-stone-500 mb-1">Start Month</label>
                          <input
                            type="number"
                            min="1"
                            value={s.start_month}
                            onChange={(e) => {
                              const updated = [...cascadeShocks];
                              updated[idx].start_month = parseInt(e.target.value) || 1;
                              setCascadeShocks(updated);
                            }}
                            className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg bg-white text-stone-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-stone-900"
                          />
                        </div>
                      </div>

                      {s.shock_type === "lump_sum_expense" ? (
                        <div>
                          <label className="block text-[11px] text-stone-500 mb-1">Amount (₹)</label>
                          <input
                            type="number"
                            step="5000"
                            value={s.amount}
                            onChange={(e) => {
                              const updated = [...cascadeShocks];
                              updated[idx].amount = parseFloat(e.target.value) || 0;
                              setCascadeShocks(updated);
                            }}
                            className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg bg-white text-stone-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-stone-900"
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] text-stone-500 mb-1">Magnitude (0-1)</label>
                            <input
                              type="number"
                              step="0.05"
                              value={s.magnitude_percent}
                              onChange={(e) => {
                                const updated = [...cascadeShocks];
                                updated[idx].magnitude_percent = parseFloat(e.target.value) || 0;
                                setCascadeShocks(updated);
                              }}
                              className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg bg-white text-stone-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-stone-900"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-stone-500 mb-1">Duration (Mo)</label>
                            <input
                              type="number"
                              min="1"
                              value={s.duration_months}
                              onChange={(e) => {
                                const updated = [...cascadeShocks];
                                updated[idx].duration_months = parseInt(e.target.value) || 1;
                                setCascadeShocks(updated);
                              }}
                              className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg bg-white text-stone-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-stone-900"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-stone-100 mt-4">
              <button
                type="button"
                onClick={handleRunSimulation}
                disabled={loading || !selectedGoalId}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-stone-900 hover:bg-black text-white font-medium rounded-xl shadow-soft-sm transition-all text-xs disabled:opacity-50 active:scale-[0.99]"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {loading ? "Running Math Engine..." : "Execute Stress Test"}
              </button>
            </div>
          </Card>
        </div>

        {/* Right Column: Simulation Results & Visualizer */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {simResult ? (
            <>
              {/* Top Result Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="p-4">
                  <div className="text-stone-500 text-[11px] font-medium tracking-wider uppercase">RESILIENCE SCORE</div>
                  <div className="text-2xl font-bold text-stone-950 mt-1 tabular-nums">
                    {simResult.resilience_score}/100
                  </div>
                  <Badge grade={simResult.resilience_grade} className="mt-2" />
                </Card>

                <Card className="p-4">
                  <div className="text-stone-500 text-[11px] font-medium tracking-wider uppercase">DEADLINE SLIPPAGE</div>
                  <div className="text-2xl font-bold text-amber-700 mt-1 tabular-nums">
                    +{simResult.stressed.slippage_months} Mos
                  </div>
                  <div className="text-[11px] text-stone-400 mt-1">
                    Finished at M{simResult.stressed.completion_month || 36}
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="text-stone-500 text-[11px] font-medium tracking-wider uppercase">CAPITAL SHORTFALL</div>
                  <div className="text-2xl font-bold text-rose-700 mt-1 tabular-nums">
                    {formatINR(simResult.stressed.capital_deficit)}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-1">At initial deadline</div>
                </Card>

                <Card className="p-4">
                  <div className="text-stone-500 text-[11px] font-medium tracking-wider uppercase">MINIMUM LIQUIDITY</div>
                  <div className="text-2xl font-bold text-stone-950 mt-1 tabular-nums">
                    {formatINR(simResult.stressed.minimum_cash_buffer)}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    {simResult.stressed.buffer_exhausted ? "Buffer Depleted" : "Buffer Preserved"}
                  </div>
                </Card>
              </div>

              {/* Insolvency Warning Card */}
              {simResult.cascade_triggered_insolvency && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-900 text-xs space-y-1.5 shadow-soft-sm">
                  <div className="flex items-center gap-2 font-semibold text-sm text-rose-950">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    Critical Insolvency Triggered!
                  </div>
                  <p className="leading-relaxed">
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
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-black rounded-full transition-colors shadow-soft-sm"
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
                <Card className="p-6">
                  <div className="flex items-center justify-between pb-4 border-b border-stone-200/80 mb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-600" />
                        <h3 className="font-semibold text-stone-950 text-base tracking-tight">
                          Financial Chain Reaction (Cascade Breakdown)
                        </h3>
                      </div>
                      <p className="text-xs text-stone-500 mt-1">
                        Step-by-step mathematical transmission explaining how compounded shocks erode goal solvency
                      </p>
                    </div>
                    <span className="text-xs font-mono font-medium bg-stone-100 text-stone-700 border border-stone-200 px-2.5 py-1 rounded-full">
                      {simResult.chain_reaction_steps.length} Sequenced Steps
                    </span>
                  </div>

                  {/* Progressive 5-Stage Visual Transmission Pipeline */}
                  <div className="mb-6 p-4 rounded-xl bg-stone-50 border border-stone-200/80">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-3">
                      Compounding Transmission Pipeline
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs">
                      <div className="p-3 rounded-xl bg-white border border-stone-200/80 shadow-soft-sm">
                        <div className="font-bold text-[10px] text-stone-600 uppercase">1. Trigger</div>
                        <div className="font-semibold text-stone-950 text-xs mt-0.5">Macro / Life Shock</div>
                        <div className="text-[10px] text-stone-400 mt-0.5">Disruption begins</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-stone-200/80 shadow-soft-sm">
                        <div className="font-bold text-[10px] text-stone-600 uppercase">2. Cash-Flow</div>
                        <div className="font-semibold text-stone-950 text-xs mt-0.5">Inflow Cut</div>
                        <div className="text-[10px] text-stone-400 mt-0.5">Net cashflow drops</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-stone-200/80 shadow-soft-sm">
                        <div className="font-bold text-[10px] text-stone-600 uppercase">3. Reserves</div>
                        <div className="font-semibold text-stone-950 text-xs mt-0.5">Buffer Absorbs</div>
                        <div className="text-[10px] text-stone-400 mt-0.5">Emergency fund burns</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-stone-200/80 shadow-soft-sm">
                        <div className="font-bold text-[10px] text-stone-600 uppercase">4. Savings</div>
                        <div className="font-semibold text-stone-950 text-xs mt-0.5">Savings Paused</div>
                        <div className="text-[10px] text-stone-400 mt-0.5">Goal monthly cut</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-stone-200/80 shadow-soft-sm">
                        <div className="font-bold text-[10px] text-stone-600 uppercase">5. Outcome</div>
                        <div className="font-semibold text-stone-950 text-xs mt-0.5">Deadline Delay</div>
                        <div className="text-[10px] text-stone-400 mt-0.5">Target slippage</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {simResult.chain_reaction_steps.map((step) => (
                      <div
                        key={step.step_number}
                        className={`p-4 rounded-xl border text-xs transition-all ${
                          step.is_critical
                            ? "border-rose-300 bg-rose-50/40 shadow-soft-sm"
                            : "border-stone-200/80 bg-white shadow-soft-sm"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-semibold text-[11px] ${
                              step.is_critical ? "bg-rose-600 text-white" : "bg-stone-900 text-white"
                            }`}>
                              {step.step_number}
                            </span>
                            <span className="font-semibold text-stone-950 text-xs">{step.title}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-stone-100 text-stone-700 border border-stone-200">
                              {step.timing}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] tabular-nums">
                            <span className="text-stone-500">
                              Buffer: <span className="font-semibold text-stone-800">{formatINR(step.remaining_buffer)}</span>
                            </span>
                            {step.cumulative_delay_added > 0 && (
                              <span className="text-amber-700 font-semibold">
                                +{step.cumulative_delay_added} mo delay
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-stone-600 leading-relaxed mb-3">
                          {step.goal_impact_description}
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2.5 border-t border-stone-100 text-[11px]">
                          <div>
                            <span className="text-stone-400">Monthly Cash-flow: </span>
                            <span className={`tabular-nums font-semibold ${step.monthly_cashflow_impact < 0 ? "text-rose-700" : "text-stone-700"}`}>
                              {step.monthly_cashflow_impact < 0 ? "-" : ""}{formatINR(Math.abs(step.monthly_cashflow_impact))}
                            </span>
                          </div>
                          <div>
                            <span className="text-stone-400">Contribution Cut: </span>
                            <span className="tabular-nums font-semibold text-amber-700">
                              {formatINR(step.monthly_contribution_change)}/mo
                            </span>
                          </div>
                          <div>
                            <span className="text-stone-400">Disruption: </span>
                            <span className="font-medium text-stone-700 uppercase">
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
                <Card className="p-6 border-stone-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200/80 mb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <h3 className="font-semibold text-stone-950 text-base tracking-tight">
                          Deterministic Root-Cause Analysis: &ldquo;Why Did My Goal Fail / Become Fragile?&rdquo;
                        </h3>
                      </div>
                      <p className="text-xs text-stone-500 mt-1">
                        Quantitative attribution without AI speculation — directly derived from verified engine mechanics
                      </p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-stone-100 text-stone-800 border border-stone-200">
                      Driver: {simResult.failure_diagnostic.primary_vulnerability}
                    </span>
                  </div>

                  {/* Headline & 4-metric Summary */}
                  <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/70 mb-5">
                    <div className="font-semibold text-stone-950 text-xs mb-3">
                      {simResult.failure_diagnostic.headline}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <div className="text-[11px] text-stone-500">Cash-Flow Contraction</div>
                        <div className="font-bold tabular-nums text-rose-700 mt-0.5">
                          {formatINR(simResult.failure_diagnostic.cashflow_drop_monthly)}/mo
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-stone-500">Emergency Buffer Absorbed</div>
                        <div className="font-bold tabular-nums text-stone-950 mt-0.5">
                          {formatINR(simResult.failure_diagnostic.buffer_absorbed_total)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-stone-500">Monthly Contribution Cut</div>
                        <div className="font-bold tabular-nums text-amber-700 mt-0.5">
                          {formatINR(simResult.failure_diagnostic.contribution_drop_monthly)}/mo
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-stone-500">Deadline Delay</div>
                        <div className="font-bold tabular-nums text-stone-950 mt-0.5">
                          +{simResult.failure_diagnostic.deadline_slippage_months} Mos
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5-Step Numbered Root Causes */}
                  <div className="space-y-2 text-xs">
                    <div className="font-semibold text-stone-900 text-xs uppercase tracking-wider mb-2">
                      Failure Progression Sequence:
                    </div>
                    {simResult.failure_diagnostic.root_causes.map((cause, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50/50 border border-stone-200/60 text-stone-700 shadow-soft-sm">
                        <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 font-semibold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{cause}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Next Steps Transition Hub */}
              <div className="p-6 rounded-2xl bg-stone-900 text-white shadow-soft-md flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                    Next Analytical Steps
                  </div>
                  <h4 className="font-semibold text-base text-white mt-1">
                    Navigate Stressed Trajectory & Recovery Options
                  </h4>
                  <p className="text-xs text-stone-400 mt-1 max-w-xl leading-relaxed">
                    Examine your safe buffer runway on the Survival Map, then solve deterministic recovery strategies.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <Link
                    href="/survival"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-stone-900 bg-white hover:bg-stone-100 rounded-xl transition-colors shadow-soft-sm"
                  >
                    Goal Survival Map <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/recovery"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-soft-sm"
                  >
                    Recovery Planner <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

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
            <Card className="py-24 text-center">
              <ShieldAlert className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="font-semibold text-stone-800 text-sm">Stress-Test Simulation Ready</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                Configure your financial shock parameters on the left and click Execute to view mathematical impact.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
