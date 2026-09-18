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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-soft-lg border border-stone-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base tracking-tight">Load Hackathon Demo Scenario</h3>
              <p className="text-xs text-stone-400 mt-0.5">
                1-click population with verified Indian Rupee (₹) financial baselines & goals
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 mx-6 mt-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        {/* Preset Cards */}
        <div className="p-6 space-y-3.5 max-h-[70vh] overflow-y-auto">
          {PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isLoading = loadingId === preset.id;
            const isLoaded = loadedId === preset.id;

            return (
              <div
                key={preset.id}
                className="p-5 rounded-2xl border border-stone-200/80 hover:border-stone-400 bg-stone-50/40 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-soft-sm"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-stone-100 text-stone-800">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="font-semibold text-sm text-stone-950 tracking-tight">{preset.title}</h4>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70">
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">
                    <span className="font-medium text-stone-900">{preset.persona}</span> · Target: {formatINR(preset.targetAmount)} in {preset.targetMonths} mos (Current: {formatINR(preset.currentBalance)})
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-stone-500 pt-1">
                    <span>Income: <strong className="text-stone-800 font-mono">{formatINR(preset.income)}/mo</strong></span>
                    <span>Buffer: <strong className="text-stone-800 font-mono">{formatINR(preset.emergencyFund)}</strong></span>
                    <span>Stress Hook: <span className="text-rose-700 font-medium">{preset.recommendedShock}</span></span>
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={() => handleLoadPreset(preset)}
                    disabled={Boolean(loadingId) || isLoaded}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold shadow-soft-sm transition-all active:scale-95 ${
                      isLoaded
                        ? "bg-emerald-600 text-white"
                        : "bg-stone-900 hover:bg-emerald-700 text-white disabled:opacity-50"
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
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200/70 flex items-center justify-between text-[11px] text-stone-500">
          <span>Data is passed through the live deterministic Python engine & MongoDB Atlas.</span>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-600 hover:text-stone-950 font-medium px-3 py-1 rounded-full hover:bg-stone-200/60 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
