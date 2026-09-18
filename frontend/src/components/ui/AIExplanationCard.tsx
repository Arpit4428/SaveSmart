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
  title = "AI Analytical Interpretation",
  className = "",
  defaultExpanded = true,
}: AIExplanationCardProps) {
  const [data, setData] = useState<ScenarioExplanationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFullDetails, setShowFullDetails] = useState(false);

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
    } catch (err: any) {
      setError(
        err.message ||
          "AI explanation service unavailable. Your verified financial calculations remain intact."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`rounded-3xl border border-stone-200/80 bg-white shadow-soft-sm transition-all overflow-hidden ${className}`}
    >
      {/* Header Bar */}
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 bg-stone-50/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-stone-100 text-stone-700 shrink-0">
            <Sparkles className="w-4 h-4 text-stone-800" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-display font-bold uppercase tracking-wider text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200/70">
                Gemini AI
              </span>
              <h3 className="text-xs font-display font-bold text-stone-950 tracking-tight">
                {title}
              </h3>
              {data && (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-display font-medium border ${
                    data.is_fallback
                      ? "bg-stone-100 text-stone-700 border-stone-200"
                      : "bg-emerald-50 text-emerald-800 border-emerald-200"
                  }`}
                >
                  <Cpu className="w-3 h-3" />
                  {data.is_fallback ? "Fallback Engine" : "Gemini 1.5 Flash"}
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Synthesizes verified deterministic math without modifying calculations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {!data && (
            <button
              type="button"
              onClick={handleFetchExplanation}
              disabled={loading || !goalId}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-display font-semibold text-white bg-stone-900 hover:bg-black rounded-full shadow-soft-sm transition-all disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {loading ? "Synthesizing..." : "Explain This Result"}
            </button>
          )}

          {data && (
            <button
              type="button"
              onClick={handleFetchExplanation}
              disabled={loading}
              className="p-2 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
              title="Refresh AI explanation"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 text-xs text-amber-800 bg-amber-50/70 border-b border-amber-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <div className="flex-1">
            <span>{error}</span>
            <button
              type="button"
              onClick={handleFetchExplanation}
              className="ml-2 font-display font-semibold text-amber-900 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Loading state indicator */}
      {loading && !data && (
        <div className="p-8 text-center text-xs text-stone-500 space-y-2">
          <RefreshCw className="w-5 h-5 animate-spin text-stone-800 mx-auto" />
          <p className="font-display font-medium text-stone-700">Synthesizing deterministic engine results...</p>
        </div>
      )}

      {/* Primary Result & Progressive Disclosure */}
      {data && (
        <div className="p-6 sm:p-7 space-y-5 text-xs">
          {/* Headline & Concise Core Takeaway (Visible by default) */}
          <div className="space-y-3">
            <div className="font-display font-bold text-sm sm:text-base text-stone-950 leading-snug tracking-tight">
              {data.ai_explanation.headline}
            </div>

            <div className="space-y-1">
              <div className="font-display font-bold text-stone-400 text-[10px] uppercase tracking-wider">
                Analytical Narrative
              </div>
              <p className="text-stone-700 leading-relaxed font-sans text-xs sm:text-sm bg-stone-50/60 p-4 rounded-2xl border border-stone-200/60">
                {data.ai_explanation.summary}
              </p>
            </div>
          </div>

          {/* Progressive Disclosure Toggle Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowFullDetails(!showFullDetails)}
              className="inline-flex items-center gap-1.5 text-xs font-display font-semibold text-stone-800 hover:text-stone-950 bg-stone-100 hover:bg-stone-200/80 px-3.5 py-1.5 rounded-full transition-colors"
            >
              <span>{showFullDetails ? "Hide Detailed Drivers & Trade-Offs" : "View Detailed Drivers & Trade-Offs"}</span>
              {showFullDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Expanded Secondary Telemetry */}
          {showFullDetails && (
            <div className="pt-4 border-t border-stone-100 space-y-5 animate-fadeIn">
              {/* Key Drivers Grid */}
              {data.ai_explanation.key_drivers?.length > 0 && (
                <div className="space-y-2">
                  <div className="font-display font-bold text-stone-400 text-[10px] uppercase tracking-wider">
                    Primary Drivers
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {data.ai_explanation.key_drivers.map((driver, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-stone-50 border border-stone-200/60 flex items-start gap-2.5"
                      >
                        <ArrowRight className="w-3.5 h-3.5 text-stone-900 shrink-0 mt-0.5" />
                        <span className="text-stone-700 leading-relaxed">{driver}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Impact & Trade-Offs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-1">
                  <div className="font-display font-bold text-stone-500 text-[10px] uppercase tracking-wider">
                    Liquidity Impact
                  </div>
                  <p className="text-stone-700 leading-relaxed">
                    {data.ai_explanation.impact_assessment}
                  </p>
                </div>

                {data.ai_explanation.trade_offs_explained && (
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-1">
                    <div className="font-display font-bold text-stone-500 text-[10px] uppercase tracking-wider">
                      Trade-Offs
                    </div>
                    <p className="text-stone-700 leading-relaxed">
                      {data.ai_explanation.trade_offs_explained}
                    </p>
                  </div>
                )}
              </div>

              {/* Actionable Next Steps */}
              {data.ai_explanation.actionable_next_steps?.length > 0 && (
                <div className="space-y-2">
                  <div className="font-display font-bold text-stone-400 text-[10px] uppercase tracking-wider">
                    Pragmatic Action Steps
                  </div>
                  <div className="space-y-2">
                    {data.ai_explanation.actionable_next_steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/70 flex items-start gap-2.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                        <span className="text-stone-800 leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Engine Disclaimer */}
          <div className="pt-3 border-t border-stone-100 flex items-start gap-2 text-[10px] text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-normal">
              Financial calculations are computed deterministically by the Python engine. Gemini AI synthesizes verified numerical telemetry.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
