"use client";

import React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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
}

export function SurvivalChart({
  baselineCurve,
  stressedCurve,
  recoveredCurve,
  targetAmount,
}: SurvivalChartProps) {
  const maxLen = Math.max(
    baselineCurve.length,
    stressedCurve.length,
    recoveredCurve?.length || 0
  );

  const data = Array.from({ length: maxLen }, (_, i) => ({
    month: `M${i}`,
    Baseline: baselineCurve[i] !== undefined ? Math.round(baselineCurve[i]) : null,
    Stressed: stressedCurve[i] !== undefined ? Math.round(stressedCurve[i]) : null,
    Recovered: recoveredCurve && recoveredCurve[i] !== undefined ? Math.round(recoveredCurve[i]) : null,
    Target: targetAmount || null,
  }));

  return (
    <div className="w-full h-80">
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
          <Line
            type="monotone"
            dataKey="Baseline"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="Stressed"
            stroke="#e11d48"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
          />
          {recoveredCurve && (
            <Line
              type="monotone"
              dataKey="Recovered"
              stroke="#059669"
              strokeWidth={2.5}
              dot={false}
            />
          )}
          {targetAmount && (
            <Line
              type="monotone"
              dataKey="Target"
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray="2 2"
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
