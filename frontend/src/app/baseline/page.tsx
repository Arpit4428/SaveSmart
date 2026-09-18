"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { BaselineProfile } from "@/types/api";
import { formatINR, formatPercent } from "@/lib/utils";
import { Card, CardHeader } from "@/components/ui/Card";
import Link from "next/link";
import { Plus, Trash2, CheckCircle2, AlertCircle, RefreshCw, Save, ArrowRight } from "lucide-react";

export default function BaselinePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<BaselineProfile>({
    user_id: "demo_user",
    monthly_net_income: 120000,
    fixed_expenses: {
      rent_or_mortgage: 35000,
      utilities: 6000,
      insurance: 4000,
      subscriptions_and_bills: 3000,
    },
    discretionary_expenses: {
      dining_out: 10000,
      entertainment: 5000,
      shopping: 8000,
      other: 3000,
    },
    debt_commitments: [
      {
        name: "Auto Loan",
        monthly_payment: 12500,
        remaining_balance: 380000,
        interest_rate_annual: 0.085,
        is_variable_rate: true,
      },
    ],
    emergency_fund_balance: 150000,
  });

  async function loadBaseline() {
    try {
      setLoading(true);
      const data = await api.getBaseline();
      if (data) setProfile(data);
    } catch {
      // Fallback to default if not saved yet
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBaseline();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSavedSuccess(false);
      const res = await api.saveBaseline(profile);
      setProfile(res);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save baseline profile");
    } finally {
      setSaving(false);
    }
  }

  function addDebt() {
    setProfile({
      ...profile,
      debt_commitments: [
        ...profile.debt_commitments,
        {
          name: "New Loan",
          monthly_payment: 5000,
          remaining_balance: 100000,
          interest_rate_annual: 0.10,
          is_variable_rate: false,
        },
      ],
    });
  }

  function removeDebt(idx: number) {
    const updated = [...profile.debt_commitments];
    updated.splice(idx, 1);
    setProfile({ ...profile, debt_commitments: updated });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Baseline Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Define your net income, non-negotiable living costs, flexible spending, and liabilities in INR (₹).
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Baseline saved successfully! Free cash flow recalculated deterministically by Financial Engine.</span>
          </div>
          <Link
            href="/stress-test"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs transition-colors shrink-0 shadow-sm"
          >
            Proceed to Stress-Test Lab <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Detailed Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Income & Emergency Fund */}
          <Card>
            <CardHeader title="1. Monthly Net Income & Emergency Fund" subtitle="Your core liquid capacity in INR (₹)" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Monthly Net Take-Home Income (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={profile.monthly_net_income}
                  onChange={(e) => setProfile({ ...profile, monthly_net_income: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Current Emergency Cushion (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={profile.emergency_fund_balance}
                  onChange={(e) => setProfile({ ...profile, emergency_fund_balance: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </Card>

          {/* Fixed Expenses */}
          <Card>
            <CardHeader title="2. Fixed Non-Negotiable Expenses" subtitle="Living obligations required every month" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Rent or Mortgage (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={profile.fixed_expenses.rent_or_mortgage}
                  onChange={(e) => setProfile({
                    ...profile,
                    fixed_expenses: { ...profile.fixed_expenses, rent_or_mortgage: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Utilities & Maintenance (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="200"
                  value={profile.fixed_expenses.utilities}
                  onChange={(e) => setProfile({
                    ...profile,
                    fixed_expenses: { ...profile.fixed_expenses, utilities: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Insurance (Health/Term/Auto) (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="200"
                  value={profile.fixed_expenses.insurance}
                  onChange={(e) => setProfile({
                    ...profile,
                    fixed_expenses: { ...profile.fixed_expenses, insurance: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Essential Bills & Subscriptions (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={profile.fixed_expenses.subscriptions_and_bills}
                  onChange={(e) => setProfile({
                    ...profile,
                    fixed_expenses: { ...profile.fixed_expenses, subscriptions_and_bills: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </Card>

          {/* Discretionary Expenses */}
          <Card>
            <CardHeader title="3. Flexible Discretionary Spending" subtitle="Spending that can be cut during crisis" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Dining Out & Delivery (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={profile.discretionary_expenses.dining_out}
                  onChange={(e) => setProfile({
                    ...profile,
                    discretionary_expenses: { ...profile.discretionary_expenses, dining_out: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Entertainment & Recreation (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={profile.discretionary_expenses.entertainment}
                  onChange={(e) => setProfile({
                    ...profile,
                    discretionary_expenses: { ...profile.discretionary_expenses, entertainment: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Shopping & Leisure (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={profile.discretionary_expenses.shopping}
                  onChange={(e) => setProfile({
                    ...profile,
                    discretionary_expenses: { ...profile.discretionary_expenses, shopping: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Other Miscellaneous (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="200"
                  value={profile.discretionary_expenses.other}
                  onChange={(e) => setProfile({
                    ...profile,
                    discretionary_expenses: { ...profile.discretionary_expenses, other: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </Card>

          {/* Debt Commitments */}
          <Card>
            <CardHeader
              title="4. Debt Obligations & EMIs"
              subtitle="Loans and recurring financing commitments"
              action={
                <button
                  type="button"
                  onClick={addDebt}
                  className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Loan
                </button>
              }
            />

            {profile.debt_commitments.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">No debt obligations recorded. You are debt-free!</p>
            ) : (
              <div className="space-y-3">
                {profile.debt_commitments.map((debt, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row gap-3 items-end text-xs">
                    <div className="flex-1 w-full">
                      <label className="block font-medium text-slate-600 mb-1">Loan Name</label>
                      <input
                        type="text"
                        value={debt.name}
                        onChange={(e) => {
                          const updated = [...profile.debt_commitments];
                          updated[idx].name = e.target.value;
                          setProfile({ ...profile, debt_commitments: updated });
                        }}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white"
                      />
                    </div>

                    <div className="w-full sm:w-28">
                      <label className="block font-medium text-slate-600 mb-1">EMI (₹/mo)</label>
                      <input
                        type="number"
                        min="0"
                        value={debt.monthly_payment}
                        onChange={(e) => {
                          const updated = [...profile.debt_commitments];
                          updated[idx].monthly_payment = parseFloat(e.target.value) || 0;
                          setProfile({ ...profile, debt_commitments: updated });
                        }}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white"
                      />
                    </div>

                    <div className="w-full sm:w-32">
                      <label className="block font-medium text-slate-600 mb-1">Balance (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={debt.remaining_balance}
                        onChange={(e) => {
                          const updated = [...profile.debt_commitments];
                          updated[idx].remaining_balance = parseFloat(e.target.value) || 0;
                          setProfile({ ...profile, debt_commitments: updated });
                        }}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white"
                      />
                    </div>

                    <div className="flex items-center gap-2 pb-1.5">
                      <label className="flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={debt.is_variable_rate || false}
                          onChange={(e) => {
                            const updated = [...profile.debt_commitments];
                            updated[idx].is_variable_rate = e.target.checked;
                            setProfile({ ...profile, debt_commitments: updated });
                          }}
                        />
                        Floating Rate
                      </label>

                      <button
                        type="button"
                        onClick={() => removeDebt(idx)}
                        className="text-slate-400 hover:text-rose-600 ml-1"
                        title="Remove debt"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Col: Live Financial Summary */}
        <div className="space-y-4">
          <Card className="sticky top-24">
            <CardHeader title="Deterministic Engine Summary" subtitle="Live cashflow calculation in INR (₹)" />

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Net Take-Home Income:</span>
                <span className="font-semibold text-slate-900">{formatINR(profile.monthly_net_income)}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Total Fixed Expenses:</span>
                <span className="font-semibold text-slate-900">
                  {formatINR(
                    Object.values(profile.fixed_expenses).reduce((a, b) => (typeof b === "number" ? a + b : a), 0)
                  )}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Total Discretionary:</span>
                <span className="font-semibold text-slate-900">
                  {formatINR(
                    Object.values(profile.discretionary_expenses).reduce((a, b) => (typeof b === "number" ? a + b : a), 0)
                  )}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Total Debt Payments:</span>
                <span className="font-semibold text-slate-900">
                  {formatINR(profile.debt_commitments.reduce((a, b) => a + b.monthly_payment, 0))}
                </span>
              </div>

              {profile.summary && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1">
                  <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wide">
                    Net Free Cash Flow (FCF)
                  </div>
                  <div className="text-lg font-bold text-emerald-700">
                    {formatINR(profile.summary.net_free_cash_flow)}
                  </div>
                  <div className="text-[11px] text-emerald-800">
                    Savings Capacity: {formatPercent(profile.summary.savings_capacity_percent)}
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition-colors text-xs disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Calculating & Saving..." : "Save Baseline Profile"}
                </button>
              </div>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
}
