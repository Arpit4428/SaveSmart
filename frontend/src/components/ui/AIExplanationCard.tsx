"use client";

import React, { useState } from "react";
import { api } from "@/lib/api-client";
import {
  ScenarioExplanationRequest,
  ScenarioExplanationResponse,
  ShockEvent,
} from "@/types/api";
import {
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Info,
  CheckCircle2,
  Cpu,
} from "lucide-react";

interface AIExplanationCardProps {
  goalId: string;
  explanationType: "health" | "stress_test" | "cascade" | "recovery" | "survival";
  shocks?: ShockEvent[];
  horizonMonths?: number;
  title?: string;
  className?: string;
  defaultExpanded?: boolean;
}

export function AIExplanationCard({
  goalId,
  explanationType,
  shocks,
  horizonMonths = 36,
  title = "AI Financial Resilience Explanation",
  className = "",
  defaultExpanded = false,
}: AIExplanationCardProps) {
  const [data, setData] = useState<ScenarioExplanationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  async function handleFetchExplanation() {
    if (!goalId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.explainScenario({
        goal_id: goalId,
        explanation_type: explanationType,
        shocks,
        horizon_months: horizonMonths,
      });
      setData(res);
      setIsExpanded(true);
    } catch (err: any) {
      setError(
        err.message ||
          "AI explanation service unavailable. Your verified financial analysis remains fully accessible."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/20 shadow-xs transition-all ${className}`}
    >
      {/* Top Banner & Control Bar */}
      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100/60">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                {title}
              </h3>
              {data && (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${
                    data.is_fallback
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-indigo-50 text-indigo-700 border-indigo-200"
                  }`}
                >
                  <Cpu className="w-3 h-3" />
                  {data.is_fallback ? "Verified Fallback Engine" : "Gemini 1.5 Flash"}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Numbers are calculated by SaveSmart&apos;s deterministic financial engine. AI only explains the verified results.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {!data && (
            <button
              type="button"
              onClick={handleFetchExplanation}
              disabled={loading || !goalId}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {loading ? "Analyzing..." : "Explain This Result"}
            </button>
          )}

          {data && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleFetchExplanation}
                disabled={loading}
                className="p-1.5 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                title="Refresh AI explanation"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1 rounded transition-colors"
              >
                <span>{isExpanded ? "Collapse" : "Expand"}</span>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 text-xs text-amber-800 bg-amber-50/70 border-b border-amber-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <div className="flex-1">
            <span>{error}</span>
            <div className="mt-1.5">
              <button
                type="button"
                onClick={handleFetchExplanation}
                className="text-[11px] font-semibold text-amber-900 underline hover:no-underline"
              >
                Retry Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading state indicator */}
      {loading && !data && (
        <div className="p-6 text-center text-xs text-slate-500 space-y-2">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-600 mx-auto" />
          <p className="font-medium text-slate-700">Synthesizing deterministic engine results...</p>
          <p className="text-[11px] text-slate-400">
            Applying zero-hallucination firewall verification across cash flow, buffer, and slippage data.
          </p>
        </div>
      )}

      {/* Expanded Explanation Content */}
      {data && isExpanded && (
        <div className="p-5 space-y-4 text-xs">
          {/* Headline Banner */}
          <div className="p-3.5 rounded-lg bg-indigo-50/80 border border-indigo-200/70">
            <h4 className="font-bold text-indigo-950 text-xs sm:text-sm leading-snug">
              {data.ai_explanation.headline}
            </h4>
          </div>

          {/* Narrative Summary */}
          <div className="space-y-1.5">
            <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
              Analytical Narrative
            </div>
            <p className="text-slate-700 leading-relaxed bg-white/70 p-3 rounded-lg border border-slate-200/70">
              {data.ai_explanation.summary}
            </p>
          </div>

          {/* Key Drivers */}
          {data.ai_explanation.key_drivers?.length > 0 && (
            <div className="space-y-1.5">
              <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
                Primary Financial Drivers
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {data.ai_explanation.key_drivers.map((driver, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-white/80 border border-slate-200/80 flex items-start gap-2"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="text-slate-700 leading-tight">{driver}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Impact & Trade-Offs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Impact Assessment */}
            <div className="p-3 rounded-lg bg-white/80 border border-slate-200/80 space-y-1">
              <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
                Liquidity & Timeline Impact
              </div>
              <p className="text-slate-600 leading-relaxed">
                {data.ai_explanation.impact_assessment}
              </p>
            </div>

            {/* Trade-Offs Explained */}
            {data.ai_explanation.trade_offs_explained && (
              <div className="p-3 rounded-lg bg-white/80 border border-slate-200/80 space-y-1">
                <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
                  Strategic Trade-Offs
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {data.ai_explanation.trade_offs_explained}
                </p>
              </div>
            )}
          </div>

          {/* Actionable Next Steps (Strictly Budgeting, NOT Investment Advice) */}
          {data.ai_explanation.actionable_next_steps?.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
                Pragmatic Resilience Steps
              </div>
              <div className="space-y-1.5">
                {data.ai_explanation.actionable_next_steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200/60 flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-slate-700 leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mandatory Engine Disclaimer */}
          <div className="pt-2 border-t border-slate-100 flex items-start gap-1.5 text-[10px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{data.disclaimer}</span>
          </div>
        </div>
      )}
    </div>
  );
}
