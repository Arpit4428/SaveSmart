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

interface SurvivalChartProps {
  baselineCurve: number[];
  stressedCurve: number[];
  recoveredCurve?: number[];
  targetAmount?: number;
  targetDeadlineMonths?: number;
  firstUnsafeMonth?: number | null;
  recoveryPointMonth?: number | null;
  height?: number | string;
}

export function SurvivalChart({
  baselineCurve,
  stressedCurve,
  recoveredCurve,
  targetAmount,
  targetDeadlineMonths,
  firstUnsafeMonth,
  recoveryPointMonth,
  height = "26rem",
}: SurvivalChartProps) {
  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({});
  const [focusedSeries, setFocusedSeries] = useState<string | null>(null);

  const maxLen = Math.max(
    baselineCurve.length,
    stressedCurve.length,
    recoveredCurve?.length || 0
  );

  const data = Array.from({ length: maxLen }, (_, i) => {
    const baselineVal = baselineCurve[i] !== undefined ? Math.round(baselineCurve[i]) : null;
    const stressedVal = stressedCurve[i] !== undefined ? Math.round(stressedCurve[i]) : null;
    const recoveredVal = recoveredCurve && recoveredCurve[i] !== undefined ? Math.round(recoveredCurve[i]) : null;

    return {
      month: `M${i}`,
      monthNum: i,
      baseline: baselineVal,
      stressed: stressedVal,
      recovered: recoveredVal,
    };
  });

  const toggleSeries = (key: string) => {
    setHiddenSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const formatYAxis = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
    return `₹${val}`;
  };

  // Custom Interactive Editorial Tooltip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const currentMonthNum = parseInt(String(label).replace("M", "")) || 0;
    const isUnsafe = firstUnsafeMonth && currentMonthNum >= firstUnsafeMonth && (!recoveryPointMonth || currentMonthNum < recoveryPointMonth);
    const isRecovered = recoveryPointMonth && currentMonthNum >= recoveryPointMonth;

    const baselineItem = payload.find((p: any) => p.dataKey === "baseline");
    const stressedItem = payload.find((p: any) => p.dataKey === "stressed");
    const recoveredItem = payload.find((p: any) => p.dataKey === "recovered");

    const baselineVal = baselineItem?.value;
    const stressedVal = stressedItem?.value;
    const recoveredVal = recoveredItem?.value;

    const deficit = baselineVal !== undefined && stressedVal !== undefined ? stressedVal - baselineVal : null;
    const recoveryGain = recoveredVal !== undefined && stressedVal !== undefined ? recoveredVal - stressedVal : null;

    return (
      <div className="bg-[#0f172a]/95 text-white p-4 rounded-2xl shadow-soft-lg border border-slate-700/60 backdrop-blur-md text-xs space-y-2.5 min-w-[210px] animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-700/60">
          <div className="flex items-center gap-1.5 font-display font-bold text-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Timeline Point: {label}</span>
          </div>
          <span
            className={`text-[9px] font-display font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              isRecovered
                ? "bg-emerald-900/80 text-emerald-300 border border-emerald-500/40"
                : isUnsafe
                ? "bg-rose-900/80 text-rose-300 border border-rose-500/40"
                : "bg-slate-800 text-slate-300 border border-slate-700"
            }`}
          >
            {isRecovered ? "Recovered" : isUnsafe ? "Disrupted" : "Baseline"}
          </span>
        </div>

        {/* Series Values */}
        <div className="space-y-1.5 font-sans">
          {baselineItem && !hiddenSeries.baseline && (
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Baseline Plan:
              </span>
              <span className="font-display font-bold tabular-nums text-slate-200">
                {baselineVal !== null && baselineVal !== undefined ? formatINR(baselineVal) : "—"}
              </span>
            </div>
          )}

          {stressedItem && !hiddenSeries.stressed && (
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Stressed Shock:
              </span>
              <span className="font-display font-bold tabular-nums text-rose-300">
                {stressedVal !== null && stressedVal !== undefined ? formatINR(stressedVal) : "—"}
              </span>
            </div>
          )}

          {recoveredItem && !hiddenSeries.recovered && (
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Recovered Path:
              </span>
              <span className="font-display font-bold tabular-nums text-emerald-300">
                {recoveredVal !== null && recoveredVal !== undefined ? formatINR(recoveredVal) : "—"}
              </span>
            </div>
          )}
        </div>

        {/* Dynamic Delta Metrics */}
        {(deficit !== null || recoveryGain !== null) && (
          <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] font-display">
            {deficit !== null && deficit < 0 && (
              <span className="text-rose-400 tabular-nums">
                Deficit: -{formatINR(Math.abs(deficit))}
              </span>
            )}
            {recoveryGain !== null && recoveryGain > 0 && (
              <span className="text-emerald-400 tabular-nums ml-auto">
                Gained: +{formatINR(recoveryGain)}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-3">
      {/* Interactive Legend Bar with Click-to-Toggle & Hover Focus */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Baseline Toggle */}
          <button
            type="button"
            onClick={() => toggleSeries("baseline")}
            onMouseEnter={() => setFocusedSeries("baseline")}
            onMouseLeave={() => setFocusedSeries(null)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-display font-medium border transition-all cursor-pointer ${
              hiddenSeries.baseline
                ? "bg-stone-100 text-stone-400 border-stone-200 line-through opacity-60"
                : focusedSeries === "baseline"
                ? "bg-slate-100 text-slate-900 border-slate-400 shadow-soft-sm scale-105"
                : "bg-white text-slate-700 border-stone-200/80 hover:bg-stone-50"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span>Baseline Target</span>
          </button>

          {/* Stressed Toggle */}
          <button
            type="button"
            onClick={() => toggleSeries("stressed")}
            onMouseEnter={() => setFocusedSeries("stressed")}
            onMouseLeave={() => setFocusedSeries(null)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-display font-medium border transition-all cursor-pointer ${
              hiddenSeries.stressed
                ? "bg-stone-100 text-stone-400 border-stone-200 line-through opacity-60"
                : focusedSeries === "stressed"
                ? "bg-rose-50 text-rose-900 border-rose-400 shadow-soft-sm scale-105"
                : "bg-white text-rose-700 border-stone-200/80 hover:bg-rose-50/50"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-600" />
            <span>Stressed Trajectory</span>
          </button>

          {/* Recovered Toggle */}
          {recoveredCurve && (
            <button
              type="button"
              onClick={() => toggleSeries("recovered")}
              onMouseEnter={() => setFocusedSeries("recovered")}
              onMouseLeave={() => setFocusedSeries(null)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-display font-medium border transition-all cursor-pointer ${
                hiddenSeries.recovered
                  ? "bg-stone-100 text-stone-400 border-stone-200 line-through opacity-60"
                : focusedSeries === "recovered"
                  ? "bg-emerald-50 text-emerald-950 border-emerald-400 shadow-soft-sm scale-105"
                  : "bg-white text-emerald-800 border-stone-200/80 hover:bg-emerald-50/50"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>Recovered Strategy</span>
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
      <div className="w-full relative" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 25, left: 10, bottom: 8 }}>
            <defs>
              {/* Subtle Area Gradients for editorial depth */}
              <linearGradient id="recoveredAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.14} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="stressedAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e11d48" stopOpacity={0.08} />
                <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="baselineAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.05} />
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            {/* Minimalist Horizontal Gridlines Only */}
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

            {/* Target Amount Horizontal Reference Line */}
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

            {/* Target Deadline Vertical Line */}
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

            {/* First Unsafe Month Marker */}
            {firstUnsafeMonth !== undefined && firstUnsafeMonth !== null && firstUnsafeMonth > 0 && firstUnsafeMonth < maxLen && (
              <ReferenceLine
                x={`M${firstUnsafeMonth}`}
                stroke="#e11d48"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                label={{
                  value: `Unsafe Point (M${firstUnsafeMonth})`,
                  fill: "#e11d48",
                  fontSize: 10,
                  position: "insideBottomLeft",
                  fontWeight: 600,
                }}
              />
            )}

            {/* Recovery Point Marker */}
            {recoveryPointMonth !== undefined && recoveryPointMonth !== null && recoveryPointMonth > 0 && recoveryPointMonth < maxLen && (
              <ReferenceLine
                x={`M${recoveryPointMonth}`}
                stroke="#059669"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                label={{
                  value: `Recovery Parity (M${recoveryPointMonth})`,
                  fill: "#059669",
                  fontSize: 10,
                  position: "insideBottomRight",
                  fontWeight: 600,
                }}
              />
            )}

            {/* Baseline Curve & Subtle Area */}
            {!hiddenSeries.baseline && (
              <>
                <Area
                  type="monotone"
                  dataKey="baseline"
                  fill="url(#baselineAreaGrad)"
                  stroke="none"
                  isAnimationActive={true}
                />
                <Line
                  type="monotone"
                  dataKey="baseline"
                  name="Baseline"
                  stroke="#94a3b8"
                  strokeWidth={focusedSeries === "baseline" ? 3 : 2}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={{ r: 6, fill: "#64748b", stroke: "#ffffff", strokeWidth: 2.5 }}
                  isAnimationActive={true}
                  animationDuration={750}
                />
              </>
            )}

            {/* Stressed Shock Curve & Subtle Area */}
            {!hiddenSeries.stressed && (
              <>
                <Area
                  type="monotone"
                  dataKey="stressed"
                  fill="url(#stressedAreaGrad)"
                  stroke="none"
                  isAnimationActive={true}
                />
                <Line
                  type="monotone"
                  dataKey="stressed"
                  name="Stressed"
                  stroke="#0f172a"
                  strokeWidth={focusedSeries === "stressed" ? 3.5 : 2.5}
                  dot={false}
                  activeDot={{ r: 6, fill: "#e11d48", stroke: "#ffffff", strokeWidth: 2.5 }}
                  isAnimationActive={true}
                  animationDuration={850}
                />
              </>
            )}

            {/* Recovered Strategy Curve & Soft Glow Area */}
            {recoveredCurve && !hiddenSeries.recovered && (
              <>
                <Area
                  type="monotone"
                  dataKey="recovered"
                  fill="url(#recoveredAreaGrad)"
                  stroke="none"
                  isAnimationActive={true}
                />
                <Line
                  type="monotone"
                  dataKey="recovered"
                  name="Recovered"
                  stroke="#059669"
                  strokeWidth={focusedSeries === "recovered" ? 3.5 : 2.5}
                  dot={false}
                  activeDot={{ r: 6, fill: "#059669", stroke: "#ffffff", strokeWidth: 2.5 }}
                  isAnimationActive={true}
                  animationDuration={950}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
