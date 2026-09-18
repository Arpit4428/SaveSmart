"use client";

import React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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
  const maxLen = Math.max(
    baselineCurve?.length || 0,
    stressedCurve?.length || 0,
    recoveredCurve?.length || 0
  );

  const data = Array.from({ length: maxLen }, (_, i) => ({
    month: `M${i}`,
    "Baseline Buffer": baselineCurve && baselineCurve[i] !== undefined ? Math.round(baselineCurve[i]) : null,
    "Stressed Buffer": stressedCurve && stressedCurve[i] !== undefined ? Math.round(stressedCurve[i]) : null,
    "Recovered Buffer": recoveredCurve && recoveredCurve[i] !== undefined ? Math.round(recoveredCurve[i]) : null,
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
          />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(val: any) => [
              val !== undefined && val !== null ? formatINR(Number(val)) : "N/A",
              "",
            ]}
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />

          {/* Insolvency line at y=0 */}
          <ReferenceLine
            y={0}
            stroke="#e11d48"
            strokeDasharray="2 2"
            label={{ value: "Insolvency (₹0)", fill: "#e11d48", fontSize: 10, position: "insideBottomLeft" }}
          />

          {/* Safe buffer threshold */}
          {safeBufferThreshold && safeBufferThreshold > 0 && (
            <ReferenceLine
              y={safeBufferThreshold}
              stroke="#d97706"
              strokeDasharray="3 3"
              label={{
                value: `Safe Buffer (${formatINR(safeBufferThreshold)})`,
                fill: "#d97706",
                fontSize: 10,
                position: "insideTopLeft",
              }}
            />
          )}

          <Line
            type="monotone"
            dataKey="Baseline Buffer"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="Stressed Buffer"
            stroke="#e11d48"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
          />
          {recoveredCurve && (
            <Line
              type="monotone"
              dataKey="Recovered Buffer"
              stroke="#059669"
              strokeWidth={2}
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
