"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Goal, GoalCreateInput, GoalHealthReport } from "@/types/api";
import { formatINR } from "@/lib/utils";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ResilienceFingerprint } from "@/components/ui/ResilienceFingerprint";
import { AssumptionLedger } from "@/components/ui/AssumptionLedger";
import { AIExplanationCard } from "@/components/ui/AIExplanationCard";
import Link from "next/link";
import { Plus, Trash2, ShieldCheck, AlertCircle, RefreshCw, X, ArrowRight } from "lucide-react";

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Goal health inspection modal state
  const [inspectingGoal, setInspectingGoal] = useState<Goal | null>(null);
  const [healthReport, setHealthReport] = useState<GoalHealthReport | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  // Form state
  const [form, setForm] = useState<GoalCreateInput>({
    name: "",
    category: "housing",
    target_amount: 500000,
    current_balance: 50000,
    target_months: 24,
    priority: "high",
  });
  const [submitting, setSubmitting] = useState(false);

  async function loadGoals() {
    try {
      setLoading(true);
      const data = await api.getGoals();
      setGoals(data);
    } catch (err: any) {
      setError(err.message || "Failed to load goals");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGoals();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      setSubmitting(true);
      await api.createGoal(form);
      setForm({
        name: "",
        category: "housing",
        target_amount: 500000,
        current_balance: 50000,
        target_months: 24,
        priority: "high",
      });
      await loadGoals();
    } catch (err: any) {
      alert(`Error creating goal: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(goalId: string) {
    if (!confirm("Are you sure you want to delete this goal?")) return;
    try {
      await api.deleteGoal(goalId);
      await loadGoals();
      if (inspectingGoal?.id === goalId) {
        setInspectingGoal(null);
        setHealthReport(null);
      }
    } catch (err: any) {
      alert(`Error deleting goal: ${err.message}`);
    }
  }

  async function handleInspectHealth(goal: Goal) {
    setInspectingGoal(goal);
    setHealthReport(null);
    setHealthLoading(true);
    try {
      const report = await api.getGoalHealth(goal.id);
      setHealthReport(report);
    } catch (err: any) {
      alert(`Failed to evaluate goal health: ${err.message}`);
    } finally {
      setHealthLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-stone-100 border border-stone-200/60 text-[11px] font-medium text-stone-600 mb-2">
            <span>Step 1 of 5</span>
            <span className="text-stone-300">•</span>
            <span>Target Architecture</span>
          </div>
          <h1 className="text-3xl font-semibold text-stone-950 tracking-tight">Goal Builder & Health Analyzer</h1>
          <p className="text-sm text-stone-500 mt-1 max-w-2xl">
            Configure savings goals and analyze pre-shock financial durability deterministically before subjecting them to simulated disruptions.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-sm flex items-center gap-2.5 shadow-soft-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7-8 Cols: Goal List & Diagnostics */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <Card>
            <CardHeader
              title="Registered Savings Goals"
              subtitle="All targets and monthly commitments computed deterministically by engine"
            />

            {loading ? (
              <div className="py-16 flex flex-col justify-center items-center text-stone-500 text-sm">
                <RefreshCw className="w-5 h-5 animate-spin mb-2 text-stone-400" />
                <span>Loading registered goals...</span>
              </div>
            ) : goals.length === 0 ? (
              <div className="py-16 text-center text-sm text-stone-500 border-2 border-dashed border-stone-200 rounded-2xl p-8">
                <p className="font-medium text-stone-700">No savings goals created yet</p>
                <p className="text-xs text-stone-400 mt-1">Use the builder form on the right to establish your primary target.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => {
                  const progress = goal.target_amount > 0 ? (goal.current_balance / goal.target_amount) * 100 : 0;
                  const isInspecting = inspectingGoal?.id === goal.id;
                  return (
                    <div
                      key={goal.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isInspecting
                          ? "border-stone-900 bg-stone-50/50 shadow-soft-md"
                          : "border-stone-200/80 bg-white hover:border-stone-300 shadow-soft-sm"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="font-semibold text-stone-950 text-base tracking-tight">{goal.name}</h3>
                            <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                              {goal.category}
                            </span>
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-stone-100/70 text-stone-500">
                              {goal.priority} priority
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 mt-1">
                            Target Horizon: <span className="font-medium text-stone-700">{goal.target_months} months</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleInspectHealth(goal)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-stone-800 bg-stone-100 hover:bg-stone-200/80 border border-stone-200 rounded-full transition-colors"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                            Goal Health
                          </button>
                          <button
                            onClick={() => handleDelete(goal.id)}
                            className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Delete goal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5 pt-3">
                        <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-stone-500 tabular-nums">
                          <span>Current: <strong className="font-semibold text-stone-800">{formatINR(goal.current_balance)}</strong></span>
                          <span>Target: <strong className="font-semibold text-stone-800">{formatINR(goal.target_amount)}</strong> ({progress.toFixed(0)}%)</span>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-stone-100 flex justify-between items-center text-xs">
                        <span className="text-stone-500">Calculated Required Monthly Contribution:</span>
                        <span className="font-semibold text-stone-900 tabular-nums">
                          {formatINR(goal.monthly_contribution || 0)}/mo
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Goal Health Inspection Modal / Card */}
          {inspectingGoal && (
            <Card className="border-stone-300 shadow-soft-md">
              <div className="flex items-start justify-between pb-4 border-b border-stone-200">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-[10px] font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                    Pre-Shock Evaluation
                  </div>
                  <h3 className="font-semibold text-stone-950 text-base tracking-tight">
                    Pre-Shock Health Diagnostics: {inspectingGoal.name}
                  </h3>
                  <p className="text-xs text-stone-500">Evaluated against your baseline cash flow</p>
                </div>
                <button
                  onClick={() => setInspectingGoal(null)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {healthLoading ? (
                <div className="py-12 flex flex-col justify-center items-center text-xs text-stone-500">
                  <RefreshCw className="w-5 h-5 animate-spin mb-2 text-stone-400" />
                  <span>Evaluating financial resilience across cash flow and debt liabilities...</span>
                </div>
              ) : healthReport ? (
                <div className="space-y-6 pt-4 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/70">
                      <div className="text-[11px] text-stone-500 font-medium">Resilience Score</div>
                      <div className="text-xl font-bold text-stone-950 tabular-nums mt-0.5">
                        {healthReport.baseline_resilience_score}/100
                      </div>
                      <Badge grade={healthReport.health_status} className="mt-2" />
                    </div>

                    <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/70">
                      <div className="text-[11px] text-stone-500 font-medium">FCF Margin</div>
                      <div className={`text-base font-bold tabular-nums mt-0.5 ${healthReport.free_cash_flow_margin >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                        {formatINR(healthReport.free_cash_flow_margin)}
                      </div>
                      <div className="text-[11px] text-stone-400 mt-1">Monthly buffer</div>
                    </div>

                    <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/70">
                      <div className="text-[11px] text-stone-500 font-medium">Emergency Cushion</div>
                      <div className="text-base font-bold text-stone-950 tabular-nums mt-0.5">
                        {healthReport.emergency_buffer_months} mos
                      </div>
                      <div className="text-[11px] text-stone-400 mt-1">Fixed costs coverage</div>
                    </div>

                    <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/70">
                      <div className="text-[11px] text-stone-500 font-medium">Debt to Income</div>
                      <div className="text-base font-bold text-stone-950 tabular-nums mt-0.5">
                        {(healthReport.debt_to_income_ratio * 100).toFixed(1)}%
                      </div>
                      <div className="text-[11px] text-stone-400 mt-1">Monthly burden</div>
                    </div>
                  </div>

                  {healthReport.risk_factors.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-stone-900 text-xs uppercase tracking-wider">Identified Vulnerabilities:</h4>
                      <div className="space-y-2">
                        {healthReport.risk_factors.map((rf, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-white border border-stone-200 flex items-start gap-2.5 text-xs shadow-soft-sm"
                          >
                            <Badge variant={rf.severity === "HIGH" ? "danger" : "warning"}>
                              {rf.severity}
                            </Badge>
                            <span className="text-stone-700 flex-1 leading-relaxed">{rf.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {healthReport.resilience_fingerprint && (
                    <ResilienceFingerprint
                      fingerprint={healthReport.resilience_fingerprint}
                      title="Goal Resilience Fingerprint"
                      subtitle="Evaluated against your baseline cash flow and debt obligations"
                    />
                  )}

                  <AIExplanationCard
                    goalId={inspectingGoal.id}
                    explanationType="health"
                    title="AI Goal Health Diagnostics: Baseline Fragility"
                  />

                  {healthReport.assumption_ledger && (
                    <AssumptionLedger ledger={healthReport.assumption_ledger} />
                  )}

                  <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                    <span className="text-stone-500 font-medium text-xs">Ready to test against disruptions?</span>
                    <Link
                      href="/stress-test"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-black text-white font-medium rounded-xl text-xs transition-colors shadow-soft-sm"
                    >
                      Stress-Test This Goal <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : null}
            </Card>
          )}
        </div>

        {/* Right Col: Goal Creator Form */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-24">
          <Card>
            <CardHeader
              title="Create New Goal"
              subtitle="Set your target amount and timeline in INR (₹)"
            />

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1.5">Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. House Down Payment"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:bg-white transition-all text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:bg-white transition-all text-xs"
                >
                  <option value="housing">Housing / Down Payment</option>
                  <option value="emergency">Emergency Cushion</option>
                  <option value="vehicle">Vehicle / Upgrade</option>
                  <option value="education">Education</option>
                  <option value="investment">Investment Capital</option>
                  <option value="lifestyle">Lifestyle / Travel</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1.5">Target Amount (₹)</label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    required
                    value={form.target_amount}
                    onChange={(e) => setForm({ ...form, target_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:bg-white transition-all text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1.5">Current Balance (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={form.current_balance}
                    onChange={(e) => setForm({ ...form, current_balance: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:bg-white transition-all text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1.5">Target Horizon (Months)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    required
                    value={form.target_months}
                    onChange={(e) => setForm({ ...form, target_months: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:bg-white transition-all text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1.5">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:bg-white transition-all text-xs"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-stone-900 hover:bg-black text-white font-medium rounded-xl shadow-soft-sm transition-all text-xs disabled:opacity-50 active:scale-[0.99]"
                >
                  <Plus className="w-4 h-4" />
                  {submitting ? "Creating Goal..." : "Add Savings Goal"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
