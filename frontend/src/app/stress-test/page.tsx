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
  AlertCircle,
  RefreshCw,
  Zap,
  ChevronDown,
  ChevronUp,
  Activity,
  Layers,
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

  // Accordion state for deep telemetry
  const [showChainReaction, setShowChainReaction] = useState(true);
  const [showFingerprint, setShowFingerprint] = useState(true);
  const [showLedger, setShowLedger] = useState(false);

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
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-200/50 border border-stone-300/60 text-[10px] font-display font-medium text-stone-700 tracking-wider uppercase mb-2">
            <span>Disruption Simulation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-stone-950 tracking-tight">
            Stress-Test Lab & Cascade Mode
          </h1>
          <p className="text-base sm:text-lg text-stone-600 font-serif italic mt-1">
            SHOCK → IMPACT → OUTCOME: Calculate capital survival before disruptions happen.
          </p>
        </div>

        {/* Goal & Mode Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedGoalId}
            onChange={(e) => setSelectedGoalId(e.target.value)}
            className="text-xs font-display font-semibold px-3.5 py-2 border border-stone-300/80 rounded-full bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 shadow-soft-sm"
          >
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} ({formatINR(g.target_amount)})
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 bg-stone-200/50 p-1 rounded-full border border-stone-300/60 text-xs font-display font-semibold">
            <button
              onClick={() => setMode("single")}
              className={`px-3.5 py-1.5 rounded-full transition-all ${
                mode === "single" ? "bg-white text-stone-950 shadow-soft-sm" : "text-stone-600 hover:text-stone-950"
              }`}
            >
              Single Shock
            </button>
            <button
              onClick={() => setMode("cascade")}
              className={`px-3.5 py-1.5 rounded-full transition-all ${
                mode === "cascade" ? "bg-white text-stone-950 shadow-soft-sm" : "text-stone-600 hover:text-stone-950"
              }`}
            >
              Cascade Mode
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Controls Left + Results Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Shock Setup Form */}
        <div className="lg:col-span-4 sticky top-24 space-y-6">
          <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-soft-sm space-y-4">
            <div className="pb-3 border-b border-stone-100">
              <h3 className="font-display font-bold text-stone-950 text-base">
                {mode === "single" ? "Single Shock Setup" : "Cascade Shock Sequencer"}
              </h3>
              <p className="text-xs text-stone-500">Inject cash flow shock parameters</p>
            </div>

            {mode === "single" ? (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-display font-semibold text-stone-700 mb-1.5">Shock Type</label>
                  <select
                    value={singleShock.shock_type}
                    onChange={(e) =>
                      setSingleShock({ ...singleShock, shock_type: e.target.value as ShockType })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 text-xs font-display font-medium"
                  >
                    <option value="income_drop">Income Reduction (Job loss, gap)</option>
                    <option value="lump_sum_expense">Lump Sum Outflow (Medical cost)</option>
                    <option value="inflation_spike">Inflation Spike (Cost surge)</option>
                    <option value="interest_rate_hike">Interest Rate Hike (EMI jump)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-display font-semibold text-stone-700 mb-1.5">Start Month</label>
                    <input
                      type="number"
                      min="1"
                      value={singleShock.start_month}
                      onChange={(e) =>
                        setSingleShock({ ...singleShock, start_month: parseInt(e.target.value) || 1 })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-stone-900 text-xs font-display"
                    />
                  </div>

                  {singleShock.shock_type !== "lump_sum_expense" && (
                    <div>
                      <label className="block font-display font-semibold text-stone-700 mb-1.5">Duration (Mo)</label>
                      <input
                        type="number"
                        min="1"
                        value={singleShock.duration_months}
                        onChange={(e) =>
                          setSingleShock({ ...singleShock, duration_months: parseInt(e.target.value) || 1 })
                        }
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-stone-900 text-xs font-display"
                      />
                    </div>
                  )}
                </div>

                {singleShock.shock_type === "lump_sum_expense" ? (
                  <div>
                    <label className="block font-display font-semibold text-stone-700 mb-1.5">Expense Outflow (₹)</label>
                    <input
                      type="number"
                      step="5000"
                      value={singleShock.amount}
                      onChange={(e) =>
                        setSingleShock({ ...singleShock, amount: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-stone-900 text-xs font-display"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-display font-semibold text-stone-700 mb-1.5">
                      Magnitude: {((singleShock.magnitude_percent || 0) * 100).toFixed(0)}%
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
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-display font-semibold text-stone-900">Cascade Shocks</span>
                  <button
                    type="button"
                    onClick={addCascadeShock}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-display font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Shock
                  </button>
                </div>

                <div className="space-y-2.5">
                  {cascadeShocks.map((s, idx) => (
                    <div key={idx} className="p-3 bg-stone-50 border border-stone-200/80 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-display font-semibold text-stone-900 text-[11px]">Shock #{idx + 1}</span>
                        {cascadeShocks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCascadeShock(idx)}
                            className="text-stone-400 hover:text-rose-600 p-1 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={s.shock_type}
                          onChange={(e) => {
                            const updated = [...cascadeShocks];
                            updated[idx].shock_type = e.target.value as ShockType;
                            setCascadeShocks(updated);
                          }}
                          className="px-2 py-1 text-xs border border-stone-200 rounded-lg bg-white text-stone-900 font-display"
                        >
                          <option value="income_drop">Income Drop</option>
                          <option value="lump_sum_expense">Lump Sum Cost</option>
                          <option value="inflation_spike">Inflation</option>
                          <option value="interest_rate_hike">Rate Hike</option>
                        </select>

                        <input
                          type="number"
                          min="1"
                          placeholder="Start Mo"
                          value={s.start_month}
                          onChange={(e) => {
                            const updated = [...cascadeShocks];
                            updated[idx].start_month = parseInt(e.target.value) || 1;
                            setCascadeShocks(updated);
                          }}
                          className="px-2 py-1 text-xs border border-stone-200 rounded-lg bg-white text-stone-900 tabular-nums font-display"
                        />
                      </div>

                      {s.shock_type === "lump_sum_expense" ? (
                        <input
                          type="number"
                          step="5000"
                          placeholder="Amount in ₹"
                          value={s.amount}
                          onChange={(e) => {
                            const updated = [...cascadeShocks];
                            updated[idx].amount = parseFloat(e.target.value) || 0;
                            setCascadeShocks(updated);
                          }}
                          className="w-full px-2 py-1 text-xs border border-stone-200 rounded-lg bg-white text-stone-900 tabular-nums font-display"
                        />
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            step="0.05"
                            placeholder="Magnitude (0-1)"
                            value={s.magnitude_percent}
                            onChange={(e) => {
                              const updated = [...cascadeShocks];
                              updated[idx].magnitude_percent = parseFloat(e.target.value) || 0;
                              setCascadeShocks(updated);
                            }}
                            className="px-2 py-1 text-xs border border-stone-200 rounded-lg bg-white text-stone-900 tabular-nums font-display"
                          />
                          <input
                            type="number"
                            min="1"
                            placeholder="Duration (Mo)"
                            value={s.duration_months}
                            onChange={(e) => {
                              const updated = [...cascadeShocks];
                              updated[idx].duration_months = parseInt(e.target.value) || 1;
                              setCascadeShocks(updated);
                            }}
                            className="px-2 py-1 text-xs border border-stone-200 rounded-lg bg-white text-stone-900 tabular-nums font-display"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={handleRunSimulation}
                disabled={loading || !selectedGoalId}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-stone-950 hover:bg-black text-white font-display font-semibold rounded-full shadow-soft-sm transition-all text-xs disabled:opacity-50 active:scale-95"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {loading ? "Running Math Engine..." : "Execute Stress Test"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Simulation Results */}
        <div className="lg:col-span-8 space-y-6">
          {simResult ? (
            <>
              {/* 1. PRIMARY RESULT: 4 Key Metric Figures */}
              <div className="rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-soft-sm grid grid-cols-2 sm:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-stone-100">
                <div className="space-y-1">
                  <div className="text-stone-400 text-[10px] font-display font-bold uppercase tracking-wider">RESILIENCE SCORE</div>
                  <div className="text-3xl font-display font-bold text-stone-950 tabular-nums tracking-tight">
                    {simResult.resilience_score}<span className="text-sm font-normal text-stone-400">/100</span>
                  </div>
                  <div className="pt-1">
                    <Badge grade={simResult.resilience_grade} />
                  </div>
                </div>

                <div className="space-y-1 sm:pl-6 pt-4 sm:pt-0">
                  <div className="text-stone-400 text-[10px] font-display font-bold uppercase tracking-wider">DEADLINE SLIPPAGE</div>
                  <div className="text-3xl font-display font-bold text-amber-700 tabular-nums tracking-tight">
                    +{simResult.stressed.slippage_months} <span className="text-xs font-normal text-stone-400">Mos</span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Finishes M{simResult.stressed.completion_month || 36}
                  </p>
                </div>

                <div className="space-y-1 sm:pl-6 pt-4 sm:pt-0">
                  <div className="text-stone-400 text-[10px] font-display font-bold uppercase tracking-wider">CAPITAL SHORTFALL</div>
                  <div className="text-3xl font-display font-bold text-rose-700 tabular-nums tracking-tight">
                    {formatINR(simResult.stressed.capital_deficit)}
                  </div>
                  <p className="text-[11px] text-stone-400">At initial deadline</p>
                </div>

                <div className="space-y-1 sm:pl-6 pt-4 sm:pt-0">
                  <div className="text-stone-400 text-[10px] font-display font-bold uppercase tracking-wider">MIN LIQUIDITY</div>
                  <div className="text-3xl font-display font-bold text-stone-950 tabular-nums tracking-tight">
                    {formatINR(simResult.stressed.minimum_cash_buffer)}
                  </div>
                  <div className="text-[11px] font-display font-semibold flex items-center gap-1.5 pt-0.5">
                    <span className={`w-2 h-2 rounded-full ${simResult.stressed.buffer_exhausted ? "bg-rose-600" : "bg-emerald-600"}`} />
                    <span className={simResult.stressed.buffer_exhausted ? "text-rose-700" : "text-emerald-800"}>
                      {simResult.stressed.buffer_exhausted ? "Buffer Depleted" : "Buffer Preserved"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Insolvency Warning Banner */}
              {simResult.cascade_triggered_insolvency && (
                <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs space-y-1 shadow-soft-sm">
                  <div className="flex items-center gap-2 font-display font-bold text-sm text-rose-950">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    Critical Buffer Insolvency Triggered
                  </div>
                  <p className="leading-relaxed text-rose-800">
                    Emergency cushion was fully exhausted in Month {simResult.insolvency_first_month}. Peak deficit reached {formatINR(simResult.peak_deficit)}.
                  </p>
                </div>
              )}

              {/* 2. KEY VISUAL: Trajectory Comparison Chart */}
              <div className="rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-soft-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
                  <div>
                    <h3 className="font-display font-bold text-base text-stone-950 tracking-tight">
                      Goal Trajectory: Baseline vs. Stressed Simulation
                    </h3>
                    <p className="text-xs text-stone-500">Monthly cumulative savings balance in INR (₹)</p>
                  </div>
                  <Link
                    href="/recovery"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-display font-semibold text-white bg-stone-950 hover:bg-black rounded-full transition-colors shadow-soft-sm shrink-0"
                  >
                    Compare Recovery Plans <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <SurvivalChart
                  baselineCurve={simResult.monthly_timeline.map((t) => t.baseline_balance)}
                  stressedCurve={simResult.monthly_timeline.map((t) => t.stressed_balance)}
                  targetAmount={selectedGoal?.target_amount}
                  targetDeadlineMonths={selectedGoal?.target_months}
                />
              </div>

              {/* 3. ROOT CAUSE ANALYSIS: Why Did My Goal Fail? */}
              {simResult.failure_diagnostic && (
                <div className="rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-soft-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                    <div>
                      <div className="text-[10px] font-display font-bold uppercase tracking-wider text-amber-800 mb-0.5">
                        Quantitative Attribution
                      </div>
                      <h3 className="font-serif italic text-xl sm:text-2xl text-stone-950">
                        Why Did My Goal Fail / Become Fragile?
                      </h3>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-display font-semibold bg-stone-100 text-stone-800 border border-stone-200 uppercase self-start sm:self-auto">
                      Driver: {simResult.failure_diagnostic.primary_vulnerability}
                    </span>
                  </div>

                  {/* Headline & 4-metric Summary */}
                  <div className="bg-stone-50/70 rounded-2xl p-5 border border-stone-200/60 space-y-3">
                    <p className="font-serif italic text-stone-900 text-sm leading-relaxed">
                      {simResult.failure_diagnostic.headline}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2 border-t border-stone-200/60">
                      <div>
                        <div className="text-[10px] font-display font-bold uppercase text-stone-400">Cash-Flow Cut</div>
                        <div className="font-display font-bold tabular-nums text-rose-700 text-lg mt-0.5">
                          {formatINR(simResult.failure_diagnostic.cashflow_drop_monthly)}<span className="text-xs font-normal">/mo</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-display font-bold uppercase text-stone-400">Buffer Absorbed</div>
                        <div className="font-display font-bold tabular-nums text-stone-950 text-lg mt-0.5">
                          {formatINR(simResult.failure_diagnostic.buffer_absorbed_total)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-display font-bold uppercase text-stone-400">Contribution Cut</div>
                        <div className="font-display font-bold tabular-nums text-amber-700 text-lg mt-0.5">
                          {formatINR(simResult.failure_diagnostic.contribution_drop_monthly)}<span className="text-xs font-normal">/mo</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-display font-bold uppercase text-stone-400">Deadline Delay</div>
                        <div className="font-display font-bold tabular-nums text-stone-950 text-lg mt-0.5">
                          +{simResult.failure_diagnostic.deadline_slippage_months} Mos
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Root Causes List */}
                  <div className="space-y-2 text-xs">
                    <div className="font-display font-bold text-stone-400 text-[10px] uppercase tracking-wider">
                      Failure Progression Sequence
                    </div>
                    {simResult.failure_diagnostic.root_causes.map((cause, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-stone-50/50 border border-stone-200/60 text-stone-700">
                        <span className="w-5 h-5 rounded-full bg-stone-900 text-white font-display font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{cause}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. AI EXPLANATION LAYER */}
              <AIExplanationCard
                goalId={selectedGoalId}
                explanationType={mode === "cascade" ? "cascade" : "stress_test"}
                shocks={mode === "cascade" ? cascadeShocks : [singleShock]}
                horizonMonths={36}
                title={mode === "cascade" ? "AI Cascade Analysis: Why Multi-Shocks Compound" : "AI Stress-Test Analysis: Impact & Drivers"}
              />

              {/* 5. CASCADE MODE: Financial Chain Reaction Sequencer */}
              {simResult.chain_reaction_steps && simResult.chain_reaction_steps.length > 0 && (
                <div className="rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-soft-sm space-y-4">
                  <button
                    type="button"
                    onClick={() => setShowChainReaction(!showChainReaction)}
                    className="w-full flex items-center justify-between text-left pb-3 border-b border-stone-100"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-600" />
                        <h3 className="font-display font-bold text-stone-950 text-base tracking-tight">
                          Financial Chain Reaction (Cascade Sequencer)
                        </h3>
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Mathematical step-by-step transmission pipeline
                      </p>
                    </div>
                    <span className="text-stone-400">
                      {showChainReaction ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>

                  {showChainReaction && (
                    <div className="space-y-4 pt-2">
                      {/* Progressive 5-Stage Visual Transmission Pipeline */}
                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                          <div className="p-2.5 rounded-xl bg-white border border-stone-200/80 shadow-soft-sm">
                            <div className="font-display font-bold text-[10px] text-stone-400 uppercase">1. Trigger</div>
                            <div className="font-display font-semibold text-stone-950 text-xs mt-0.5">Macro Shock</div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white border border-stone-200/80 shadow-soft-sm">
                            <div className="font-display font-bold text-[10px] text-stone-400 uppercase">2. Cash-Flow</div>
                            <div className="font-display font-semibold text-stone-950 text-xs mt-0.5">Inflow Cut</div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white border border-stone-200/80 shadow-soft-sm">
                            <div className="font-display font-bold text-[10px] text-stone-400 uppercase">3. Reserves</div>
                            <div className="font-display font-semibold text-stone-950 text-xs mt-0.5">Buffer Absorbs</div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white border border-stone-200/80 shadow-soft-sm">
                            <div className="font-display font-bold text-[10px] text-stone-400 uppercase">4. Savings</div>
                            <div className="font-display font-semibold text-stone-950 text-xs mt-0.5">Savings Paused</div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white border border-stone-200/80 shadow-soft-sm col-span-2 sm:col-span-1">
                            <div className="font-display font-bold text-[10px] text-stone-400 uppercase">5. Outcome</div>
                            <div className="font-display font-semibold text-stone-950 text-xs mt-0.5">Deadline Delay</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {simResult.chain_reaction_steps.map((step) => (
                          <div
                            key={step.step_number}
                            className={`p-4 rounded-2xl border text-xs transition-all ${
                              step.is_critical
                                ? "border-rose-300 bg-rose-50/40 shadow-soft-sm"
                                : "border-stone-200/80 bg-white shadow-soft-sm"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-display font-bold text-[10px] ${
                                  step.is_critical ? "bg-rose-600 text-white" : "bg-stone-900 text-white"
                                }`}>
                                  {step.step_number}
                                </span>
                                <span className="font-display font-semibold text-stone-950 text-xs">{step.title}</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-display uppercase bg-stone-100 text-stone-700 border border-stone-200">
                                  {step.timing}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-[11px] tabular-nums font-display">
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

                            <p className="text-stone-600 leading-relaxed mb-2">
                              {step.goal_impact_description}
                            </p>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-stone-100 text-[11px] font-display">
                              <div>
                                <span className="text-stone-400">Cash-flow: </span>
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
                    </div>
                  )}
                </div>
              )}

              {/* 6. RESILIENCE FINGERPRINT */}
              {simResult.resilience_fingerprint && (
                <ResilienceFingerprint fingerprint={simResult.resilience_fingerprint} />
              )}

              {/* 7. ASSUMPTIONS LEDGER */}
              {simResult.assumption_ledger && (
                <AssumptionLedger ledger={simResult.assumption_ledger} />
              )}
            </>
          ) : (
            <div className="py-24 text-center rounded-3xl border border-stone-200/80 bg-white p-8">
              <ShieldAlert className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <h3 className="font-display font-semibold text-stone-800 text-sm">Stress-Test Simulation Ready</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                Configure your financial shock parameters on the left and click Execute to view deterministic mathematical outcomes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
