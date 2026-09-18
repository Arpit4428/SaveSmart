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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-stone-100 border border-stone-200/60 text-[11px] font-medium text-stone-600 mb-2">
            <span>Step 2 of 5</span>
            <span className="text-stone-300">•</span>
            <span>Cash Flow Foundations</span>
          </div>
          <h1 className="text-3xl font-semibold text-stone-950 tracking-tight">Financial Baseline Profile</h1>
          <p className="text-sm text-stone-500 mt-1 max-w-2xl">
            Define your net income, non-negotiable living costs, flexible spending, and liabilities in INR (₹).
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-soft-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">Baseline saved successfully! Free cash flow recalculated deterministically by Financial Engine.</span>
          </div>
          <Link
            href="/stress-test"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-medium rounded-xl text-xs transition-colors shrink-0 shadow-soft-sm"
          >
            Proceed to Stress-Test Lab <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-sm flex items-center gap-2.5 shadow-soft-sm">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7-8 Cols: Detailed Inputs */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Income & Emergency Fund */}
          <Card>
            <CardHeader title="1. Monthly Net Income & Emergency Fund" subtitle="Your core liquid capacity in INR (₹)" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1.5">Monthly Net Take-Home Income (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={profile.monthly_net_income}
                  onChange={(e) => setProfile({ ...profile, monthly_net_income: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:bg-white transition-all text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1.5">Current Emergency Cushion (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={profile.emergency_fund_balance}
                  onChange={(e) => setProfile({ ...profile, emergency_fund_balance: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:bg-white transition-all text-xs"
                />
              </div>
            </div>
          </Card>

          {/* Fixed Expenses */}
          <Card>
            <CardHeader title="2. Fixed Non-Negotiable Expenses" subtitle="Living obligations required every month" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1.5">Rent or Mortgage (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={profile.fixed_expenses.rent_or_mortgage}
                  onChange={(e) => setProfile({
                    ...profile,
                    fixed_expenses: { ...profile.fixed_expenses, rent_or_mortgage: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:bg-white transition-all text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1.5">Utilities & Maintenance (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="200"
                  value={profile.fixed_expenses.utilities}
                  onChange={(e) => setProfile({
                    ...profile,
                    fixed_expenses: { ...profile.fixed_expenses, utilities: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:bg-white transition-all text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1.5">Insurance (Health/Term/Auto) (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="200"
                  value={profile.fixed_expenses.insurance}
                  onChange={(e) => setProfile({
                    ...profile,
                    fixed_expenses: { ...profile.fixed_expenses, insurance: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:bg-white transition-all text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1.5">Essential Bills & Subscriptions (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={profile.fixed_expenses.subscriptions_and_bills}
                  onChange={(e) => setProfile({
                    ...profile,
                    fixed_expenses: { ...profile.fixed_expenses, subscriptions_and_bills: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:bg-white transition-all text-xs"
                />
              </div>
            </div>
          </Card>

          {/* Discretionary Expenses */}
          <Card>
            <CardHeader title="3. Flexible Discretionary Spending" subtitle="Spending that can be cut during crisis" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1.5">Dining Out & Delivery (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={profile.discretionary_expenses.dining_out}
                  onChange={(e) => setProfile({
                    ...profile,
                    discretionary_expenses: { ...profile.discretionary_expenses, dining_out: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:bg-white transition-all text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1.5">Entertainment & Recreation (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={profile.discretionary_expenses.entertainment}
                  onChange={(e) => setProfile({
                    ...profile,
                    discretionary_expenses: { ...profile.discretionary_expenses, entertainment: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:bg-white transition-all text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1.5">Shopping & Leisure (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={profile.discretionary_expenses.shopping}
                  onChange={(e) => setProfile({
                    ...profile,
                    discretionary_expenses: { ...profile.discretionary_expenses, shopping: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:bg-white transition-all text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1.5">Other Miscellaneous (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="200"
                  value={profile.discretionary_expenses.other}
                  onChange={(e) => setProfile({
                    ...profile,
                    discretionary_expenses: { ...profile.discretionary_expenses, other: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-stone-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:bg-white transition-all text-xs"
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
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-stone-700" /> Add Loan
                </button>
              }
            />

            {profile.debt_commitments.length === 0 ? (
              <p className="text-xs text-stone-500 py-4 text-center border border-dashed border-stone-200 rounded-xl">
                No debt obligations recorded. You are debt-free!
              </p>
            ) : (
              <div className="space-y-3">
                {profile.debt_commitments.map((debt, idx) => (
                  <div key={idx} className="p-4 bg-stone-50/60 rounded-xl border border-stone-200/80 flex flex-col sm:flex-row gap-3 items-end text-xs">
                    <div className="flex-1 w-full">
                      <label className="block font-medium text-stone-600 mb-1">Loan Name</label>
                      <input
                        type="text"
                        value={debt.name}
                        onChange={(e) => {
                          const updated = [...profile.debt_commitments];
                          updated[idx].name = e.target.value;
                          setProfile({ ...profile, debt_commitments: updated });
                        }}
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900"
                      />
                    </div>

                    <div className="w-full sm:w-28">
                      <label className="block font-medium text-stone-600 mb-1">EMI (₹/mo)</label>
                      <input
                        type="number"
                        min="0"
                        value={debt.monthly_payment}
                        onChange={(e) => {
                          const updated = [...profile.debt_commitments];
                          updated[idx].monthly_payment = parseFloat(e.target.value) || 0;
                          setProfile({ ...profile, debt_commitments: updated });
                        }}
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white text-stone-900 tabular-nums text-xs focus:outline-none focus:ring-1 focus:ring-stone-900"
                      />
                    </div>

                    <div className="w-full sm:w-32">
                      <label className="block font-medium text-stone-600 mb-1">Balance (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={debt.remaining_balance}
                        onChange={(e) => {
                          const updated = [...profile.debt_commitments];
                          updated[idx].remaining_balance = parseFloat(e.target.value) || 0;
                          setProfile({ ...profile, debt_commitments: updated });
                        }}
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white text-stone-900 tabular-nums text-xs focus:outline-none focus:ring-1 focus:ring-stone-900"
                      />
                    </div>

                    <div className="flex items-center gap-2 pb-1.5 shrink-0">
                      <label className="flex items-center gap-1.5 text-[11px] text-stone-600 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={debt.is_variable_rate || false}
                          onChange={(e) => {
                            const updated = [...profile.debt_commitments];
                            updated[idx].is_variable_rate = e.target.checked;
                            setProfile({ ...profile, debt_commitments: updated });
                          }}
                          className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                        />
                        Floating Rate
                      </label>

                      <button
                        type="button"
                        onClick={() => removeDebt(idx)}
                        className="text-stone-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50 transition-colors ml-1"
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
        <div className="lg:col-span-5 xl:col-span-4 sticky top-24">
          <Card>
            <CardHeader title="Deterministic Engine Summary" subtitle="Live cashflow calculation in INR (₹)" />

            <div className="space-y-4 text-xs">
              <div className="flex justify-between py-2 border-b border-stone-100">
                <span className="text-stone-500">Net Take-Home Income:</span>
                <span className="font-semibold text-stone-900 tabular-nums">{formatINR(profile.monthly_net_income)}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-stone-100">
                <span className="text-stone-500">Total Fixed Expenses:</span>
                <span className="font-semibold text-stone-900 tabular-nums">
                  {formatINR(
                    Object.values(profile.fixed_expenses).reduce((a, b) => (typeof b === "number" ? a + b : a), 0)
                  )}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-stone-100">
                <span className="text-stone-500">Total Discretionary:</span>
                <span className="font-semibold text-stone-900 tabular-nums">
                  {formatINR(
                    Object.values(profile.discretionary_expenses).reduce((a, b) => (typeof b === "number" ? a + b : a), 0)
                  )}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-stone-100">
                <span className="text-stone-500">Total Debt Payments:</span>
                <span className="font-semibold text-stone-900 tabular-nums">
                  {formatINR(profile.debt_commitments.reduce((a, b) => a + b.monthly_payment, 0))}
                </span>
              </div>

              {profile.summary && (
                <div className="p-4 bg-stone-50 border border-stone-200/80 rounded-2xl space-y-1.5">
                  <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                    Net Free Cash Flow (FCF)
                  </div>
                  <div className="text-2xl font-bold text-stone-950 tabular-nums tracking-tight">
                    {formatINR(profile.summary.net_free_cash_flow)}
                  </div>
                  <div className="text-xs text-stone-500 pt-1 border-t border-stone-200/60">
                    Savings Capacity: <strong className="font-semibold text-stone-900">{formatPercent(profile.summary.savings_capacity_percent)}</strong>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-stone-900 hover:bg-black text-white font-medium rounded-xl shadow-soft-sm transition-all text-xs disabled:opacity-50 active:scale-[0.99]"
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
