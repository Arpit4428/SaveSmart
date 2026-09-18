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

interface BufferRunwayChartProps {
  baselineCurve: number[];
  stressedCurve: number[];
  recoveredCurve?: number[];
  safeBufferThreshold?: number;
}

export function BufferRunwayChart({
  baselineCurve,
  stressedCurve,
  recoveredCurve,
  safeBufferThreshold,
}: BufferRunwayChartProps) {
  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({});

  const maxLen = Math.max(
    baselineCurve?.length || 0,
    stressedCurve?.length || 0,
    recoveredCurve?.length || 0
  );

  const data = Array.from({ length: maxLen }, (_, i) => ({
    month: `M${i}`,
    monthNum: i,
    "Baseline Buffer": baselineCurve && baselineCurve[i] !== undefined ? Math.round(baselineCurve[i]) : null,
    "Stressed Buffer": stressedCurve && stressedCurve[i] !== undefined ? Math.round(stressedCurve[i]) : null,
    "Recovered Buffer": recoveredCurve && recoveredCurve[i] !== undefined ? Math.round(recoveredCurve[i]) : null,
  }));

  const formatYAxis = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
    return `₹${val}`;
  };

  const toggleSeries = (key: string) => {
    setHiddenSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Custom Interactive Tooltip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const stressedItem = payload.find((p: any) => p.dataKey === "Stressed Buffer");
    const stressedVal = stressedItem?.value;
    const isFloorBreached = stressedVal !== undefined && stressedVal !== null && safeBufferThreshold && stressedVal < safeBufferThreshold;
    const isDepleted = stressedVal !== undefined && stressedVal !== null && stressedVal <= 0;

    return (
      <div className="bg-[#0f172a]/95 text-white p-4 rounded-2xl shadow-soft-lg border border-slate-700/60 backdrop-blur-md text-xs space-y-2.5 min-w-[210px] animate-fadeIn">
        <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
          <span className="font-display font-bold text-slate-200">Timeline: {label}</span>
          <span
            className={`text-[9px] font-display font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              isDepleted
                ? "bg-rose-900 text-rose-200 border border-rose-600"
                : isFloorBreached
                ? "bg-amber-900 text-amber-200 border border-amber-600"
                : "bg-emerald-900 text-emerald-200 border border-emerald-600"
            }`}
          >
            {isDepleted ? "Insolvent" : isFloorBreached ? "Buffer Breached" : "Safe Zone"}
          </span>
        </div>

        <div className="space-y-1.5 font-sans">
          {payload.map((item: any) => {
            const val = item.value;
            if (val === null || val === undefined) return null;

            const colorMap: Record<string, string> = {
              "Baseline Buffer": "text-slate-200",
              "Stressed Buffer": "text-rose-400",
              "Recovered Buffer": "text-emerald-400",
            };
            const dotMap: Record<string, string> = {
              "Baseline Buffer": "bg-slate-400",
              "Stressed Buffer": "bg-rose-500",
              "Recovered Buffer": "bg-emerald-400",
            };

            return (
              <div key={item.dataKey} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className={`w-2 h-2 rounded-full ${dotMap[item.dataKey] || "bg-slate-400"}`} />
                  {item.dataKey}:
                </span>
                <span className={`font-display font-bold tabular-nums ${colorMap[item.dataKey] || "text-slate-200"}`}>
                  {formatINR(val)}
                </span>
              </div>
            );
          })}
        </div>

        {safeBufferThreshold && (
          <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] font-display text-slate-400">
            <span>Safety Floor:</span>
            <span className="text-amber-400 tabular-nums font-semibold">{formatINR(safeBufferThreshold)}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-3">
      {/* Interactive Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Baseline Buffer Toggle */}
          <button
            type="button"
            onClick={() => toggleSeries("Baseline Buffer")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-display font-medium border transition-all cursor-pointer ${
              hiddenSeries["Baseline Buffer"]
                ? "bg-stone-100 text-stone-400 border-stone-200 line-through opacity-60"
                : "bg-white text-slate-700 border-stone-200/80 hover:bg-stone-50"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span>Baseline Reserves</span>
          </button>

          {/* Stressed Buffer Toggle */}
          <button
            type="button"
            onClick={() => toggleSeries("Stressed Buffer")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-display font-medium border transition-all cursor-pointer ${
              hiddenSeries["Stressed Buffer"]
                ? "bg-stone-100 text-stone-400 border-stone-200 line-through opacity-60"
                : "bg-white text-rose-700 border-stone-200/80 hover:bg-rose-50/50"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-600" />
            <span>Stressed Drawdown</span>
          </button>

          {/* Recovered Buffer Toggle */}
          {recoveredCurve && (
            <button
              type="button"
              onClick={() => toggleSeries("Recovered Buffer")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-display font-medium border transition-all cursor-pointer ${
                hiddenSeries["Recovered Buffer"]
                  ? "bg-stone-100 text-stone-400 border-stone-200 line-through opacity-60"
                  : "bg-white text-emerald-800 border-stone-200/80 hover:bg-emerald-50/50"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>Recovered Runway</span>
            </button>
          )}
        </div>

        {safeBufferThreshold && (
          <div className="text-[11px] font-display text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            Safety Floor: {formatYAxis(safeBufferThreshold)}
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-80 relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 15, right: 25, left: 10, bottom: 8 }}>
            <defs>
              <linearGradient id="recoveredBufferGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.14} />
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

            {/* Insolvency line at y=0 */}
            <ReferenceLine
              y={0}
              stroke="#e11d48"
              strokeDasharray="3 3"
              strokeWidth={1.5}
              label={{
                value: "Insolvency Floor (₹0)",
                fill: "#e11d48",
                fontSize: 10,
                position: "insideBottomLeft",
                fontWeight: 600,
              }}
            />

            {/* Safe buffer threshold */}
            {safeBufferThreshold && safeBufferThreshold > 0 && (
              <ReferenceLine
                y={safeBufferThreshold}
                stroke="#d97706"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Safe Threshold (${formatYAxis(safeBufferThreshold)})`,
                  fill: "#b45309",
                  fontSize: 10,
                  position: "insideTopLeft",
                  fontWeight: 600,
                }}
              />
            )}

            {/* Baseline Buffer */}
            {!hiddenSeries["Baseline Buffer"] && (
              <Line
                type="monotone"
                dataKey="Baseline Buffer"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                activeDot={{ r: 5, fill: "#64748b", stroke: "#ffffff", strokeWidth: 2 }}
                isAnimationActive={true}
                animationDuration={700}
              />
            )}

            {/* Stressed Buffer */}
            {!hiddenSeries["Stressed Buffer"] && (
              <Line
                type="monotone"
                dataKey="Stressed Buffer"
                stroke="#e11d48"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6, fill: "#e11d48", stroke: "#ffffff", strokeWidth: 2.5 }}
                isAnimationActive={true}
                animationDuration={850}
              />
            )}

            {/* Recovered Buffer & Area */}
            {recoveredCurve && !hiddenSeries["Recovered Buffer"] && (
              <>
                <Area
                  type="monotone"
                  dataKey="Recovered Buffer"
                  fill="url(#recoveredBufferGrad)"
                  stroke="none"
                  isAnimationActive={true}
                />
                <Line
                  type="monotone"
                  dataKey="Recovered Buffer"
                  stroke="#059669"
                  strokeWidth={2.5}
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
