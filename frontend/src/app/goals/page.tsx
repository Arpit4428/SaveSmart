"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Goal, GoalCreateInput, GoalHealthReport } from "@/types/api";
import { formatINR } from "@/lib/utils";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ResilienceFingerprint } from "@/components/ui/ResilienceFingerprint";
import { AssumptionLedger } from "@/components/ui/AssumptionLedger";
import { Plus, Trash2, ShieldCheck, AlertCircle, RefreshCw, X } from "lucide-react";

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Goal Builder & Health Analyzer</h1>
        <p className="text-sm text-slate-500 mt-1">
          Create savings goals and evaluate baseline durability before running stress-tests.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Goal List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader
              title="Registered Savings Goals"
              subtitle="All targets and monthly commitments computed deterministically by engine"
            />

            {loading ? (
              <div className="py-12 flex justify-center items-center text-slate-500 text-sm">
                <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading goals...
              </div>
            ) : goals.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">
                No savings goals found. Use the form on the right to create your first goal.
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => {
                  const progress = goal.target_amount > 0 ? (goal.current_balance / goal.target_amount) * 100 : 0;
                  return (
                    <div
                      key={goal.id}
                      className="p-4 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900 text-base">{goal.name}</h3>
                            <span className="text-xs uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                              {goal.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Target Horizon: {goal.target_months} months · Priority: {goal.priority}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleInspectHealth(goal)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Goal Health
                          </button>
                          <button
                            onClick={() => handleDelete(goal.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                            title="Delete goal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Current: {formatINR(goal.current_balance)}</span>
                          <span>Target: {formatINR(goal.target_amount)} ({progress.toFixed(0)}%)</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span className="text-slate-500">Calculated Required Monthly Contribution:</span>
                        <span className="font-bold text-slate-900">
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
            <Card className="border-blue-200 bg-blue-50/20">
              <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Pre-Shock Health Diagnostics: {inspectingGoal.name}
                  </h3>
                  <p className="text-xs text-slate-500">Evaluated against your baseline cash flow</p>
                </div>
                <button
                  onClick={() => setInspectingGoal(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {healthLoading ? (
                <div className="py-8 flex justify-center items-center text-xs text-slate-500">
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Evaluating financial resilience...
                </div>
              ) : healthReport ? (
                <div className="space-y-4 pt-4 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <div className="text-slate-500">Resilience Score</div>
                      <div className="text-lg font-bold text-slate-900">
                        {healthReport.baseline_resilience_score}/100
                      </div>
                      <Badge grade={healthReport.health_status} className="mt-1" />
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <div className="text-slate-500">FCF Margin</div>
                      <div className={`text-base font-bold ${healthReport.free_cash_flow_margin >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {formatINR(healthReport.free_cash_flow_margin)}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">Monthly buffer</div>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <div className="text-slate-500">Emergency Cushion</div>
                      <div className="text-base font-bold text-slate-900">
                        {healthReport.emergency_buffer_months} mos
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">Fixed costs coverage</div>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <div className="text-slate-500">Debt to Income</div>
                      <div className="text-base font-bold text-slate-900">
                        {(healthReport.debt_to_income_ratio * 100).toFixed(1)}%
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">Monthly burden</div>
                    </div>
                  </div>

                  {healthReport.risk_factors.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="font-semibold text-slate-900">Identified Vulnerabilities:</h4>
                      <div className="space-y-1.5">
                        {healthReport.risk_factors.map((rf, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded bg-white border border-slate-200 flex items-start gap-2 text-xs"
                          >
                            <Badge variant={rf.severity === "HIGH" ? "danger" : "warning"}>
                              {rf.severity}
                            </Badge>
                            <span className="text-slate-700 flex-1">{rf.description}</span>
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

                  {healthReport.assumption_ledger && (
                    <AssumptionLedger ledger={healthReport.assumption_ledger} />
                  )}
                </div>
              ) : null}
            </Card>
          )}
        </div>

        {/* Right Col: Goal Creator Form */}
        <div>
          <Card>
            <CardHeader
              title="Create New Goal"
              subtitle="Set your target amount and timeline in INR (₹)"
            />

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. House Down Payment"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
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
                  <label className="block font-medium text-slate-700 mb-1">Target Amount (₹)</label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    required
                    value={form.target_amount}
                    onChange={(e) => setForm({ ...form, target_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Current Balance (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={form.current_balance}
                    onChange={(e) => setForm({ ...form, current_balance: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Target Horizon (Months)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    required
                    value={form.target_months}
                    onChange={(e) => setForm({ ...form, target_months: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition-colors text-xs disabled:opacity-50"
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
