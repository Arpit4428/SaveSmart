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
  const maxLen = Math.max(
    aggressiveCurve?.length || 0,
    balancedCurve?.length || 0,
    extendedCurve?.length || 0,
    stressedCurve?.length || 0
  );

  const data = Array.from({ length: maxLen }, (_, i) => ({
    month: `M${i}`,
    Aggressive: aggressiveCurve && aggressiveCurve[i] !== undefined ? Math.round(aggressiveCurve[i]) : null,
    Balanced: balancedCurve && balancedCurve[i] !== undefined ? Math.round(balancedCurve[i]) : null,
    Extended: extendedCurve && extendedCurve[i] !== undefined ? Math.round(extendedCurve[i]) : null,
    Stressed: stressedCurve && stressedCurve[i] !== undefined ? Math.round(stressedCurve[i]) : null,
  }));

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 15, right: 25, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#71717a" }} />
          <YAxis
            tick={{ fontSize: 11, fill: "#71717a" }}
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
              border: "1px solid #e4e4e7",
              borderRadius: "12px",
              fontSize: "11px",
              boxShadow: "0 8px 24px -4px rgba(0, 0, 0, 0.08)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "14px" }} />

          {/* Target Amount Reference Line */}
          {targetAmount && targetAmount > 0 && (
            <ReferenceLine
              y={targetAmount}
              stroke="#64748b"
              strokeDasharray="4 4"
              label={{
                value: `Target (${formatINR(targetAmount)})`,
                fill: "#475569",
                fontSize: 10,
                position: "insideTopRight",
              }}
            />
          )}

          {/* Target Deadline Reference Line */}
          {targetDeadlineMonths && targetDeadlineMonths < maxLen && (
            <ReferenceLine
              x={`M${targetDeadlineMonths}`}
              stroke="#94a3b8"
              strokeDasharray="3 3"
              label={{
                value: `Original Deadline (M${targetDeadlineMonths})`,
                fill: "#64748b",
                fontSize: 10,
                position: "insideTopLeft",
              }}
            />
          )}

          {/* Stressed Curve */}
          {stressedCurve && (
            <Line
              type="monotone"
              dataKey="Stressed"
              stroke="#e11d48"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          )}

          {/* Aggressive Curve */}
          {aggressiveCurve && (
            <Line
              type="monotone"
              dataKey="Aggressive"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
            />
          )}

          {/* Balanced Curve */}
          {balancedCurve && (
            <Line
              type="monotone"
              dataKey="Balanced"
              stroke="#059669"
              strokeWidth={2.5}
              dot={false}
            />
          )}

          {/* Extended Curve */}
          {extendedCurve && (
            <Line
              type="monotone"
              dataKey="Extended"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
