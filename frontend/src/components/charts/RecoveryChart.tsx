"use client";

import React, { useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatINR } from "@/lib/utils";

interface RecoveryChartProps {
  aggressiveCurve?: number[];
  balancedCurve?: number[];
  extendedCurve?: number[];
  stressedCurve?: number[];
  targetAmount?: number;
  targetDeadlineMonths?: number;
}

export function RecoveryChart({
  aggressiveCurve,
  balancedCurve,
  extendedCurve,
  stressedCurve,
  targetAmount,
  targetDeadlineMonths,
}: RecoveryChartProps) {
  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({});
  const [focusedSeries, setFocusedSeries] = useState<string | null>(null);

  const maxLen = Math.max(
    aggressiveCurve?.length || 0,
    balancedCurve?.length || 0,
    extendedCurve?.length || 0,
    stressedCurve?.length || 0
  );

  const data = Array.from({ length: maxLen }, (_, i) => ({
    month: `M${i}`,
    monthNum: i,
    Aggressive: aggressiveCurve && aggressiveCurve[i] !== undefined ? Math.round(aggressiveCurve[i]) : null,
    Balanced: balancedCurve && balancedCurve[i] !== undefined ? Math.round(balancedCurve[i]) : null,
    Extended: extendedCurve && extendedCurve[i] !== undefined ? Math.round(extendedCurve[i]) : null,
    Stressed: stressedCurve && stressedCurve[i] !== undefined ? Math.round(stressedCurve[i]) : null,
  }));

  const toggleSeries = (key: string) => {
    setHiddenSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const formatYAxis = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
    return `₹${val}`;
  };

  // Custom Interactive Tooltip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const stressedItem = payload.find((p: any) => p.dataKey === "Stressed");
    const stressedVal = stressedItem?.value;

    return (
      <div className="bg-[#0f172a]/95 text-white p-4 rounded-2xl shadow-soft-lg border border-slate-700/60 backdrop-blur-md text-xs space-y-2.5 min-w-[210px] animate-fadeIn">
        <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
          <span className="font-display font-bold text-slate-200">Timeline: {label}</span>
          <span className="text-[10px] font-display text-slate-400">Recovery Pathways</span>
        </div>

        <div className="space-y-1.5 font-sans">
          {payload.map((item: any) => {
            const val = item.value;
            if (val === null || val === undefined) return null;

            const colorMap: Record<string, string> = {
              Balanced: "text-emerald-400",
              Aggressive: "text-amber-400",
              Extended: "text-blue-400",
              Stressed: "text-rose-400",
            };
            const dotMap: Record<string, string> = {
              Balanced: "bg-emerald-400",
              Aggressive: "bg-amber-400",
              Extended: "bg-blue-400",
              Stressed: "bg-rose-500",
            };

            const gain = stressedVal !== undefined && item.dataKey !== "Stressed" ? val - stressedVal : null;

            return (
              <div key={item.dataKey} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className={`w-2 h-2 rounded-full ${dotMap[item.dataKey] || "bg-slate-400"}`} />
                  {item.dataKey}:
                </span>
                <div className="text-right">
                  <div className={`font-display font-bold tabular-nums ${colorMap[item.dataKey] || "text-slate-200"}`}>
                    {formatINR(val)}
                  </div>
                  {gain !== null && gain > 0 && (
                    <div className="text-[10px] text-emerald-400 font-display tabular-nums">
                      +{formatINR(gain)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-3">
      {/* Interactive Legend Bar with Strategy Focus */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Balanced Toggle */}
          {balancedCurve && (
            <button
              type="button"
              onClick={() => toggleSeries("Balanced")}
              onMouseEnter={() => setFocusedSeries("Balanced")}
              onMouseLeave={() => setFocusedSeries(null)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-display font-medium border transition-all cursor-pointer ${
                hiddenSeries.Balanced
                  ? "bg-stone-100 text-stone-400 border-stone-200 line-through opacity-60"
                  : focusedSeries === "Balanced"
                  ? "bg-emerald-50 text-emerald-950 border-emerald-400 shadow-soft-sm scale-105"
                  : "bg-white text-emerald-800 border-stone-200/80 hover:bg-emerald-50/50"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>Balanced (Recommended)</span>
            </button>
          )}

          {/* Aggressive Toggle */}
          {aggressiveCurve && (
            <button
              type="button"
              onClick={() => toggleSeries("Aggressive")}
              onMouseEnter={() => setFocusedSeries("Aggressive")}
              onMouseLeave={() => setFocusedSeries(null)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-display font-medium border transition-all cursor-pointer ${
                hiddenSeries.Aggressive
                  ? "bg-stone-100 text-stone-400 border-stone-200 line-through opacity-60"
                  : focusedSeries === "Aggressive"
                  ? "bg-amber-50 text-amber-950 border-amber-400 shadow-soft-sm scale-105"
                  : "bg-white text-amber-800 border-stone-200/80 hover:bg-amber-50/50"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              <span>Aggressive</span>
            </button>
          )}

          {/* Extended Toggle */}
          {extendedCurve && (
            <button
              type="button"
              onClick={() => toggleSeries("Extended")}
              onMouseEnter={() => setFocusedSeries("Extended")}
              onMouseLeave={() => setFocusedSeries(null)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-display font-medium border transition-all cursor-pointer ${
                hiddenSeries.Extended
                  ? "bg-stone-100 text-stone-400 border-stone-200 line-through opacity-60"
                  : focusedSeries === "Extended"
                  ? "bg-blue-50 text-blue-950 border-blue-400 shadow-soft-sm scale-105"
                  : "bg-white text-blue-800 border-stone-200/80 hover:bg-blue-50/50"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Extended Timeline</span>
            </button>
          )}

          {/* Stressed Toggle */}
          {stressedCurve && (
            <button
              type="button"
              onClick={() => toggleSeries("Stressed")}
              onMouseEnter={() => setFocusedSeries("Stressed")}
              onMouseLeave={() => setFocusedSeries(null)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-display font-medium border transition-all cursor-pointer ${
                hiddenSeries.Stressed
                  ? "bg-stone-100 text-stone-400 border-stone-200 line-through opacity-60"
                  : focusedSeries === "Stressed"
                  ? "bg-rose-50 text-rose-950 border-rose-400 shadow-soft-sm scale-105"
                  : "bg-white text-rose-700 border-stone-200/80 hover:bg-rose-50/50"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-600" />
              <span>Unmitigated Shock</span>
            </button>
          )}
        </div>

        {/* Milestone Indicator Badges */}
        <div className="hidden sm:flex items-center gap-3 text-[11px] font-display text-stone-400">
          {targetAmount && targetAmount > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-slate-400 inline-block" /> Target ({formatYAxis(targetAmount)})
            </span>
          )}
          {targetDeadlineMonths && (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" /> M{targetDeadlineMonths} Deadline
            </span>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-96 relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 15, right: 25, left: 10, bottom: 8 }}>
            <defs>
              <linearGradient id="balancedAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            {/* Minimal Horizontal Gridlines */}
            <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#f1f0ea" />

            <XAxis
              dataKey="month"
              axisLine={{ stroke: "#e7e5e4" }}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#78716c", fontFamily: "sans-serif" }}
              dy={6}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#78716c", fontFamily: "sans-serif" }}
              tickFormatter={formatYAxis}
              dx={-4}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Target Amount Reference Line */}
            {targetAmount && targetAmount > 0 && (
              <ReferenceLine
                y={targetAmount}
                stroke="#64748b"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Target Corpus (${formatYAxis(targetAmount)})`,
                  fill: "#475569",
                  fontSize: 10,
                  position: "insideTopRight",
                  fontWeight: 600,
                }}
              />
            )}

            {/* Target Deadline Reference Line */}
            {targetDeadlineMonths && targetDeadlineMonths < maxLen && (
              <ReferenceLine
                x={`M${targetDeadlineMonths}`}
                stroke="#94a3b8"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                label={{
                  value: `Scheduled Deadline (M${targetDeadlineMonths})`,
                  fill: "#64748b",
                  fontSize: 10,
                  position: "insideTopLeft",
                  fontWeight: 500,
                }}
              />
            )}

            {/* Stressed Shock Path (Muted Reference) */}
            {stressedCurve && !hiddenSeries.Stressed && (
              <Line
                type="monotone"
                dataKey="Stressed"
                stroke="#94a3b8"
                strokeWidth={focusedSeries === "Stressed" ? 2.5 : 1.5}
                strokeDasharray="4 4"
                dot={false}
                activeDot={{ r: 5, fill: "#e11d48", stroke: "#ffffff", strokeWidth: 2 }}
                isAnimationActive={true}
                animationDuration={700}
              />
            )}

            {/* Aggressive Curve */}
            {aggressiveCurve && !hiddenSeries.Aggressive && (
              <Line
                type="monotone"
                dataKey="Aggressive"
                stroke="#d97706"
                strokeWidth={focusedSeries === "Aggressive" ? 3 : 2}
                dot={false}
                activeDot={{ r: 6, fill: "#d97706", stroke: "#ffffff", strokeWidth: 2.5 }}
                isAnimationActive={true}
                animationDuration={800}
              />
            )}

            {/* Balanced Curve (Hero) */}
            {balancedCurve && !hiddenSeries.Balanced && (
              <>
                <Area
                  type="monotone"
                  dataKey="Balanced"
                  fill="url(#balancedAreaGrad)"
                  stroke="none"
                  isAnimationActive={true}
                />
                <Line
                  type="monotone"
                  dataKey="Balanced"
                  stroke="#059669"
                  strokeWidth={focusedSeries === "Balanced" ? 3.5 : 2.5}
                  dot={false}
                  activeDot={{ r: 6, fill: "#059669", stroke: "#ffffff", strokeWidth: 2.5 }}
                  isAnimationActive={true}
                  animationDuration={900}
                />
              </>
            )}

            {/* Extended Curve */}
            {extendedCurve && !hiddenSeries.Extended && (
              <Line
                type="monotone"
                dataKey="Extended"
                stroke="#2563eb"
                strokeWidth={focusedSeries === "Extended" ? 3 : 2}
                dot={false}
                activeDot={{ r: 6, fill: "#2563eb", stroke: "#ffffff", strokeWidth: 2.5 }}
                isAnimationActive={true}
                animationDuration={1000}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
