"use client";

import React from "react";
import { ResilienceFingerprint as FingerprintType } from "@/types/api";

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
      description: "Emergency reserves relative to safe 3-6 month spending benchmark",
    },
    {
      key: "cashflow_flexibility",
      label: "Cash-flow Flexibility",
      score: fingerprint.cashflow_flexibility,
      description: "Discretionary spending buffer available to absorb cuts",
    },
    {
      key: "debt_pressure_safety",
      label: "Debt Pressure Safety",
      score: fingerprint.debt_pressure_safety,
      description: "Protection against fixed debt servicing commitments",
    },
    {
      key: "goal_capacity_cushion",
      label: "Goal Capacity Cushion",
      score: fingerprint.goal_capacity_cushion,
      description: "Free cash flow headroom remaining after funding monthly targets",
    },
    {
      key: "shock_recovery_velocity",
      label: "Shock Recovery Velocity",
      score: fingerprint.shock_recovery_velocity,
      description: "Structural speed to restore reserves and recover target trajectory",
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-700 bg-emerald-600";
    if (score >= 60) return "text-blue-700 bg-blue-600";
    if (score >= 40) return "text-amber-700 bg-amber-600";
    return "text-rose-700 bg-rose-600";
  };

  const getScoreBadge = (grade: string) => {
    switch (grade) {
      case "A+":
      case "A":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "B":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "C":
        return "bg-amber-50 text-amber-800 border-amber-200";
      default:
        return "bg-rose-50 text-rose-800 border-rose-200";
    }
  };

  // Calculate 5-axis radar polygon points
  const cx = 130;
  const cy = 130;
  const maxR = 95;

  const points = axes.map((axis, i) => {
    const angle = ((-90 + i * 72) * Math.PI) / 180;
    const r = (axis.score / 100) * maxR;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      outerX: cx + maxR * Math.cos(angle),
      outerY: cy + maxR * Math.sin(angle),
      labelX: cx + (maxR + 22) * Math.cos(angle),
      labelY: cy + (maxR + 18) * Math.sin(angle),
      ...axis,
    };
  });

  const polygonString = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className={`rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-soft-sm space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-stone-100">
        <div>
          <div className="text-[10px] font-display font-bold uppercase tracking-widest text-emerald-800 mb-1">
            Resilience Diagnostic
          </div>
          <h3 className="font-serif italic text-2xl sm:text-3xl text-stone-950">{title}</h3>
          <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3 bg-stone-50 px-4 py-2 rounded-2xl border border-stone-200/60 self-start sm:self-auto">
          <div className="text-right pr-3 border-r border-stone-200">
            <div className="text-[10px] uppercase font-display font-bold text-stone-400">Index</div>
            <div className="text-2xl font-display font-bold text-stone-950 tabular-nums">
              {fingerprint.overall_score}<span className="text-xs text-stone-400 font-normal">/100</span>
            </div>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-display font-bold border uppercase tracking-wider ${getScoreBadge(
              fingerprint.overall_grade
            )}`}
          >
            Grade {fingerprint.overall_grade}
          </span>
        </div>
      </div>

      {/* Main Composition: Radar Centerpiece + Compact Grouped Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left 5 Cols: SVG Radar Centerpiece */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-3 bg-stone-50/40 rounded-2xl border border-stone-200/60">
          <svg viewBox="0 0 260 260" className="w-56 h-56 sm:w-64 sm:h-64 overflow-visible">
            <defs>
              <linearGradient id="fingerprint-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#047857" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Concentric grid rings */}
            {[0.25, 0.5, 0.75, 1].map((scale) => (
              <polygon
                key={scale}
                points={axes
                  .map((_, i) => {
                    const angle = ((-90 + i * 72) * Math.PI) / 180;
                    const r = maxR * scale;
                    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="#e7e5e4"
                strokeWidth={scale === 1 ? "1.5" : "1"}
                strokeDasharray={scale === 1 ? "none" : "3 3"}
              />
            ))}

            {/* Axis spokes */}
            {points.map((p, idx) => (
              <line
                key={idx}
                x1={cx}
                y1={cy}
                x2={p.outerX}
                y2={p.outerY}
                stroke="#e7e5e4"
                strokeWidth="1"
              />
            ))}

            {/* Biometric Polygon */}
            <polygon
              points={polygonString}
              fill="url(#fingerprint-grad)"
              stroke="#047857"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Score Vertices */}
            {points.map((p, idx) => (
              <g key={idx}>
                <circle cx={p.x} cy={p.y} r="4" fill="#047857" />
                <circle cx={p.x} cy={p.y} r="6" fill="none" stroke="#ffffff" strokeWidth="2" />
              </g>
            ))}

            {/* Central Score */}
            <text
              x={cx}
              y={cy + 4}
              textAnchor="middle"
              className="text-xs font-display font-bold fill-stone-900"
            >
              {fingerprint.overall_score}
            </text>
          </svg>
        </div>

        {/* Right 7 Cols: Clean Grouped 5-Axis List (De-boxed & Compact) */}
        <div className="lg:col-span-7 divide-y divide-stone-100">
          {axes.map((axis) => {
            const colorClass = getScoreColor(axis.score);
            const textColor = colorClass.split(" ")[0];
            const barColor = colorClass.split(" ")[1];

            return (
              <div key={axis.key} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-display font-semibold text-stone-900">{axis.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-display font-bold tabular-nums ${textColor}`}>
                      {axis.score}/100
                    </span>
                    <span className="text-[10px] font-display text-stone-400">
                      {axis.score >= 80 ? "Robust" : axis.score >= 60 ? "Adequate" : axis.score >= 40 ? "Vulnerable" : "Critical"}
                    </span>
                  </div>
                </div>

                {/* Sleek inline meter */}
                <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`${barColor} h-1.5 rounded-full transition-all`}
                    style={{ width: `${axis.score}%` }}
                  />
                </div>

                <p className="text-[11px] text-stone-500 leading-snug">{axis.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
