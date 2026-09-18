"use client";

import React, { useState } from "react";
import { api } from "@/lib/api-client";
import { formatINR } from "@/lib/utils";
import { Sparkles, X, Check, RefreshCw, Home, Heart, Rocket } from "lucide-react";

interface DemoPresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PRESETS = [
  {
    id: "homebuyer",
    icon: Home,
    badge: "Primary Demo Scenario",
    title: "First-Time Homebuyer",
    persona: "Bangalore Tech Couple (Rajesh & Priya)",
    goalName: "Dream Home Down Payment",
    category: "housing",
    targetAmount: 2500000,
    currentBalance: 400000,
    targetMonths: 24,
    priority: "high",
    income: 150000,
    emergencyFund: 400000,
    fixedExpenses: {
      rent_or_mortgage: 40000,
      utilities: 6000,
      insurance: 4000,
      subscriptions_and_bills: 3000,
    },
    discretionaryExpenses: {
      dining_out: 10000,
      entertainment: 5000,
      shopping: 8000,
      other: 3000,
    },
    debtCommitments: [
      {
        name: "Auto Loan EMI",
        monthly_payment: 12500,
        remaining_balance: 380000,
        interest_rate_annual: 0.085,
        is_variable_rate: true,
      },
    ],
    recommendedShock: "35% Income Drop (Tech Layoff / Furlough)",
  },
  {
    id: "wedding",
    icon: Heart,
    badge: "Discretionary Target",
    title: "Wedding Celebration Fund",
    persona: "Mumbai Designer (Ananya)",
    goalName: "Wedding Celebration Fund",
    category: "lifestyle",
    targetAmount: 1500000,
    currentBalance: 250000,
    targetMonths: 18,
    priority: "high",
    income: 110000,
    emergencyFund: 250000,
    fixedExpenses: {
      rent_or_mortgage: 32000,
      utilities: 5000,
      insurance: 3000,
      subscriptions_and_bills: 2000,
    },
    discretionaryExpenses: {
      dining_out: 12000,
      entertainment: 4000,
      shopping: 8000,
      other: 2000,
    },
    debtCommitments: [],
    recommendedShock: "Medical Hospitalization (₹1,50,000 Outflow)",
  },
  {
    id: "startup",
    icon: Rocket,
    badge: "High Volatility",
    title: "Founder Personal Runway",
    persona: "Delhi Startup Founder (Vikram)",
    goalName: "Founder Personal Runway",
    category: "emergency",
    targetAmount: 1000000,
    currentBalance: 200000,
    targetMonths: 12,
    priority: "high",
    income: 180000,
    emergencyFund: 500000,
    fixedExpenses: {
      rent_or_mortgage: 45000,
      utilities: 8000,
      insurance: 5000,
      subscriptions_and_bills: 4000,
    },
    discretionaryExpenses: {
      dining_out: 15000,
      entertainment: 5000,
      shopping: 10000,
      other: 5000,
    },
    debtCommitments: [
      {
        name: "Education Loan",
        monthly_payment: 15000,
        remaining_balance: 450000,
        interest_rate_annual: 0.09,
        is_variable_rate: false,
      },
    ],
    recommendedShock: "Revenue Drought + Inflation Spike",
  },
];

export function DemoPresetModal({ isOpen, onClose, onSuccess }: DemoPresetModalProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleLoadPreset(preset: (typeof PRESETS)[0]) {
    setLoadingId(preset.id);
    setError(null);

    try {
      // 1. Save Baseline Profile
      await api.saveBaseline({
        user_id: "demo_user",
        monthly_net_income: preset.income,
        fixed_expenses: preset.fixedExpenses,
        discretionary_expenses: preset.discretionaryExpenses,
        debt_commitments: preset.debtCommitments,
        emergency_fund_balance: preset.emergencyFund,
      });

      // 2. Create Goal
      await api.createGoal({
        name: preset.goalName,
        category: preset.category,
        target_amount: preset.targetAmount,
        current_balance: preset.currentBalance,
        target_months: preset.targetMonths,
        priority: preset.priority,
      });

      setLoadedId(preset.id);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        window.location.reload();
      }, 700);
    } catch (err: any) {
      setError(err.message || "Failed to load demo scenario.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Load Hackathon Demo Scenario</h3>
              <p className="text-xs text-slate-400">
                1-click population with verified Indian Rupee (₹) financial baselines & goals
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 mx-5 mt-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        {/* Preset Cards */}
        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          {PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isLoading = loadingId === preset.id;
            const isLoaded = loadedId === preset.id;

            return (
              <div
                key={preset.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-slate-100 text-slate-700">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">{preset.title}</h4>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    <span className="font-medium text-slate-800">{preset.persona}</span> · Target: {formatINR(preset.targetAmount)} in {preset.targetMonths} mos (Current: {formatINR(preset.currentBalance)})
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-0.5">
                    <span>Income: <strong className="text-slate-700">{formatINR(preset.income)}/mo</strong></span>
                    <span>Buffer: <strong className="text-slate-700">{formatINR(preset.emergencyFund)}</strong></span>
                    <span>Stress Hook: <span className="text-rose-600 font-medium">{preset.recommendedShock}</span></span>
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={() => handleLoadPreset(preset)}
                    disabled={Boolean(loadingId) || isLoaded}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors ${
                      isLoaded
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-900 hover:bg-emerald-600 text-white disabled:opacity-50"
                    }`}
                  >
                    {isLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : isLoaded ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    {isLoading ? "Configuring..." : isLoaded ? "Loaded!" : "Load Scenario"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Data is passed through the live deterministic Python engine & MongoDB Atlas.</span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
