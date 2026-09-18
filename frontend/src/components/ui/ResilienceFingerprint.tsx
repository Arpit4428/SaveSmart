"use client";

import React, { useState } from "react";
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
  const [activeAxisIndex, setActiveAxisIndex] = useState<number | null>(null);

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
    if (score >= 80) return "text-emerald-700 bg-emerald-600 border-emerald-200";
    if (score >= 60) return "text-blue-700 bg-blue-600 border-blue-200";
    if (score >= 40) return "text-amber-700 bg-amber-600 border-amber-200";
    return "text-rose-700 bg-rose-600 border-rose-200";
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

  // Radar geometry
  const cx = 150;
  const cy = 150;
  const maxR = 115;

  const points = axes.map((axis, i) => {
    const angle = ((-90 + i * 72) * Math.PI) / 180;
    const r = (axis.score / 100) * maxR;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      outerX: cx + maxR * Math.cos(angle),
      outerY: cy + maxR * Math.sin(angle),
      labelX: cx + (maxR + 24) * Math.cos(angle),
      labelY: cy + (maxR + 20) * Math.sin(angle),
      ...axis,
    };
  });

  const polygonString = points.map((p) => `${p.x},${p.y}`).join(" ");
  const activeAxis = activeAxisIndex !== null ? axes[activeAxisIndex] : null;

  return (
    <div className={`rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-soft-sm space-y-6 ${className}`}>
      {/* Header Bar */}
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

      {/* Main Composition: Interactive Radar + Grouped Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left 6 Cols: Larger Interactive SVG Radar Centerpiece */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-4 bg-stone-50/40 rounded-3xl border border-stone-200/60 relative">
          <svg viewBox="0 0 300 300" className="w-64 h-64 sm:w-72 sm:h-72 overflow-visible select-none">
            <defs>
              <linearGradient id="fingerprintAreaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#047857" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.12" />
              </linearGradient>
              <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Concentric grid webs (25%, 50%, 75%, 100%) */}
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
                fill={scale === 1 ? "#fafaf9" : "none"}
                stroke="#e7e5e4"
                strokeWidth={scale === 1 ? "1.5" : "1"}
                strokeDasharray={scale === 1 ? "none" : "3 3"}
              />
            ))}

            {/* Axis spokes */}
            {points.map((p, idx) => {
              const isHovered = activeAxisIndex === idx;
              return (
                <line
                  key={idx}
                  x1={cx}
                  y1={cy}
                  x2={p.outerX}
                  y2={p.outerY}
                  stroke={isHovered ? "#059669" : "#e7e5e4"}
                  strokeWidth={isHovered ? "2" : "1"}
                  className="transition-colors duration-300"
                />
              );
            })}

            {/* Biometric Filled Polygon */}
            <polygon
              points={polygonString}
              fill="url(#fingerprintAreaGrad)"
              stroke="#047857"
              strokeWidth="2.5"
              strokeLinejoin="round"
              className="transition-all duration-500"
            />

            {/* Interactive Vertices & Spokes */}
            {points.map((p, idx) => {
              const isHovered = activeAxisIndex === idx;
              return (
                <g
                  key={idx}
                  className="cursor-pointer group"
                  onMouseEnter={() => setActiveAxisIndex(idx)}
                  onMouseLeave={() => setActiveAxisIndex(null)}
                >
                  {/* Outer Spoke Hit Area */}
                  <circle cx={p.x} cy={p.y} r="16" fill="transparent" />

                  {/* Pulsing halo on hover */}
                  {isHovered && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="10"
                      fill="#10b981"
                      fillOpacity="0.3"
                      className="animate-ping"
                    />
                  )}

                  {/* Outer Ring */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? 7 : 5}
                    fill="#047857"
                    stroke="#ffffff"
                    strokeWidth={isHovered ? 3 : 2}
                    className="transition-all duration-200"
                  />

                  {/* Vertex Score Label */}
                  <text
                    x={p.outerX}
                    y={p.outerY < cy ? p.outerY - 8 : p.outerY + 14}
                    textAnchor="middle"
                    className={`text-[10px] font-display font-semibold select-none transition-all ${
                      isHovered ? "fill-emerald-800 font-bold text-xs" : "fill-stone-500"
                    }`}
                  >
                    {p.score}
                  </text>
                </g>
              );
            })}

            {/* Central Score Callout */}
            <circle cx={cx} cy={cy} r="26" fill="#ffffff" stroke="#e7e5e4" strokeWidth="1.5" />
            <text
              x={cx}
              y={cy - 2}
              textAnchor="middle"
              className="text-xs font-display font-extrabold fill-stone-950 select-none"
            >
              {fingerprint.overall_score}
            </text>
            <text
              x={cx}
              y={cy + 12}
              textAnchor="middle"
              className="text-[9px] font-display font-bold uppercase tracking-wider fill-emerald-700 select-none"
            >
              {fingerprint.overall_grade}
            </text>
          </svg>

          {/* Interactive Active Axis Prompt / Callout */}
          <div className="mt-2 text-center h-5">
            {activeAxis ? (
              <span className="text-[11px] font-display font-semibold text-emerald-800 animate-fadeIn">
                {activeAxis.label}: <strong className="tabular-nums">{activeAxis.score}/100</strong> (
                {activeAxis.score >= 80 ? "Robust" : activeAxis.score >= 60 ? "Adequate" : activeAxis.score >= 40 ? "Vulnerable" : "Critical"})
              </span>
            ) : (
              <span className="text-[10px] font-display uppercase tracking-widest text-stone-400">
                Hover any vertex or pillar to inspect
              </span>
            )}
          </div>
        </div>

        {/* Right 6 Cols: Grouped 5-Axis Telemetry List */}
        <div className="lg:col-span-6 divide-y divide-stone-100">
          {axes.map((axis, i) => {
            const isHovered = activeAxisIndex === i;
            const colorClass = getScoreColor(axis.score);
            const textColor = colorClass.split(" ")[0];
            const barColor = colorClass.split(" ")[1];

            return (
              <div
                key={axis.key}
                onMouseEnter={() => setActiveAxisIndex(i)}
                onMouseLeave={() => setActiveAxisIndex(null)}
                className={`py-3 first:pt-0 last:pb-0 space-y-1.5 cursor-pointer rounded-2xl transition-all px-2 -mx-2 ${
                  isHovered ? "bg-emerald-50/40" : "hover:bg-stone-50/50"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full transition-all ${isHovered ? "bg-emerald-600 scale-125" : "bg-stone-300"}`} />
                    <span className={`font-display font-semibold tracking-tight transition-colors ${isHovered ? "text-emerald-950 font-bold" : "text-stone-900"}`}>
                      {axis.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-display font-bold tabular-nums ${textColor}`}>
                      {axis.score}/100
                    </span>
                    <span className="text-[10px] font-display text-stone-400 font-medium">
                      {axis.score >= 80 ? "Robust" : axis.score >= 60 ? "Adequate" : axis.score >= 40 ? "Vulnerable" : "Critical"}
                    </span>
                  </div>
                </div>

                {/* Sleek Progress Bar with hover transition */}
                <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`${barColor} h-1.5 rounded-full transition-all duration-500`}
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
