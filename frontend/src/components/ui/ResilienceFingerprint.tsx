"use client";

import React from "react";
import { ResilienceFingerprint as FingerprintType } from "@/types/api";
import { Activity } from "lucide-react";

interface ResilienceFingerprintProps {
  fingerprint?: FingerprintType;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function ResilienceFingerprint({
  fingerprint,
  className = "",
  title = "Financial Resilience Fingerprint",
  subtitle = "5-axis durability profile computed deterministically from verified engine math",
}: ResilienceFingerprintProps) {
  if (!fingerprint) return null;

  const axes = [
    {
      key: "buffer_strength",
      label: "Buffer Strength",
      score: fingerprint.buffer_strength,
      description: "Liquid emergency reserves relative to safe 3-6 month spending benchmark",
    },
    {
      key: "cashflow_flexibility",
      label: "Cash-flow Flexibility",
      score: fingerprint.cashflow_flexibility,
      description: "Discretionary spending buffer and uncommitted income available to absorb cuts",
    },
    {
      key: "debt_pressure_safety",
      label: "Debt Pressure Safety",
      score: fingerprint.debt_pressure_safety,
      description: "Protection against debt servicing burden (inversely correlated with DTI)",
    },
    {
      key: "goal_capacity_cushion",
      label: "Goal Capacity Cushion",
      score: fingerprint.goal_capacity_cushion,
      description: "Free cash flow headroom remaining after funding baseline monthly savings",
    },
    {
      key: "shock_recovery_velocity",
      label: "Shock Recovery Velocity",
      score: fingerprint.shock_recovery_velocity,
      description: "Baseline structural capability to restore reserves and recover target trajectory",
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500 text-emerald-700";
    if (score >= 60) return "bg-blue-500 text-blue-700";
    if (score >= 40) return "bg-amber-500 text-amber-700";
    return "bg-rose-500 text-rose-700";
  };

  const getScoreBadge = (grade: string) => {
    switch (grade) {
      case "A+":
      case "A":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "B":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "C":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-rose-50 text-rose-700 border-rose-200";
    }
  };

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-5 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm tracking-tight">{title}</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Resilience Index</div>
            <div className="text-xl font-bold text-slate-900">
              {fingerprint.overall_score}<span className="text-xs text-slate-400 font-normal">/100</span>
            </div>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold border uppercase tracking-wider ${getScoreBadge(
              fingerprint.overall_grade
            )}`}
          >
            Grade {fingerprint.overall_grade}
          </span>
        </div>
      </div>

      {/* 5-Axis Score Meters */}
      <div className="space-y-3.5">
        {axes.map((axis) => {
          const colorClass = getScoreColor(axis.score);
          const barColor = colorClass.split(" ")[0];
          const textColor = colorClass.split(" ")[1];

          return (
            <div key={axis.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <span>{axis.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-mono font-bold ${textColor}`}>{axis.score}/100</span>
                  <span className="text-[10px] text-slate-400">
                    {axis.score >= 80
                      ? "Robust"
                      : axis.score >= 60
                      ? "Adequate"
                      : axis.score >= 40
                      ? "Vulnerable"
                      : "Critical"}
                  </span>
                </div>
              </div>

              {/* Meter bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${Math.min(100, Math.max(0, axis.score))}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400 leading-tight">{axis.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
