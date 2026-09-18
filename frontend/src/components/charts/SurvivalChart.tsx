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
  height = "20rem",
}: SurvivalChartProps) {
  const maxLen = Math.max(
    baselineCurve.length,
    stressedCurve.length,
    recoveredCurve?.length || 0
  );

  const data = Array.from({ length: maxLen }, (_, i) => ({
    month: `M${i}`,
    "Baseline (Undisturbed)": baselineCurve[i] !== undefined ? Math.round(baselineCurve[i]) : null,
    "Stressed (Disrupted)": stressedCurve[i] !== undefined ? Math.round(stressedCurve[i]) : null,
    "Recovered (Strategy)": recoveredCurve && recoveredCurve[i] !== undefined ? Math.round(recoveredCurve[i]) : null,
  }));

  return (
    <div className="w-full" style={{ height: height || "24rem" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#71717a" }} />
          <YAxis
            tick={{ fontSize: 11, fill: "#71717a" }}
            tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
          />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(val: any, name: any) => [
              val !== undefined && val !== null ? formatINR(Number(val)) : "N/A",
              String(name),
            ]}
            labelFormatter={(label) => `Timeline Point: ${label}`}
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e4e4e7",
              borderRadius: "12px",
              fontSize: "11px",
              boxShadow: "0 8px 24px -4px rgba(0, 0, 0, 0.08)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "14px" }} />

          {/* Target Amount Horizontal Reference Line */}
          {targetAmount && targetAmount > 0 && (
            <ReferenceLine
              y={targetAmount}
              stroke="#64748b"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Goal Target (${formatINR(targetAmount)})`,
                fill: "#475569",
                fontSize: 10,
                position: "insideTopRight",
                fontWeight: 600,
              }}
            />
          )}

          {/* Target Deadline Vertical Reference Line */}
          {targetDeadlineMonths && targetDeadlineMonths < maxLen && (
            <ReferenceLine
              x={`M${targetDeadlineMonths}`}
              stroke="#94a3b8"
              strokeDasharray="3 3"
              strokeWidth={1.5}
              label={{
                value: `Deadline (M${targetDeadlineMonths})`,
                fill: "#64748b",
                fontSize: 10,
                position: "insideTopLeft",
                fontWeight: 500,
              }}
            />
          )}

          {/* First Unsafe Month / Point of Insolvency */}
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

          {/* Recovery Point / Parity Month */}
          {recoveryPointMonth !== undefined && recoveryPointMonth !== null && recoveryPointMonth > 0 && recoveryPointMonth < maxLen && (
            <ReferenceLine
              x={`M${recoveryPointMonth}`}
              stroke="#059669"
              strokeDasharray="3 3"
              strokeWidth={1.5}
              label={{
                value: `Recovery Point (M${recoveryPointMonth})`,
                fill: "#059669",
                fontSize: 10,
                position: "insideBottomRight",
                fontWeight: 600,
              }}
            />
          )}

          <Line
            type="monotone"
            dataKey="Baseline (Undisturbed)"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="Stressed (Disrupted)"
            stroke="#e11d48"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
          />
          {recoveredCurve && (
            <Line
              type="monotone"
              dataKey="Recovered (Strategy)"
              stroke="#059669"
              strokeWidth={2.5}
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
