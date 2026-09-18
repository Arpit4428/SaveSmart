"use client";

import React, { useState } from "react";
import Link from "next/link";
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
import { BaselineProfile, Goal, GoalHealthReport } from "@/types/api";
import { formatINR } from "@/lib/utils";
import { TrendingUp, ArrowRight, Wallet, PieChart } from "lucide-react";

interface DashboardOverviewProps {
  baseline: BaselineProfile | null;
  primaryGoal: Goal | null;
  goals: Goal[];
  primaryGoalHealth?: GoalHealthReport | null;
}

export function DashboardOverview({
  baseline,
  primaryGoal,
  goals,
}: DashboardOverviewProps) {
  const income = baseline?.monthly_net_income || 0;
  const fixed = baseline?.summary?.total_fixed_expenses || 0;
  const discretionary = baseline?.summary?.total_discretionary_expenses || 0;
  const debt = baseline?.summary?.total_debt_payments || 0;
  const freeCashFlow = baseline?.summary?.net_free_cash_flow || 0;
  const emergencyFund = baseline?.emergency_fund_balance || 0;

  const totalGoalCommitments = goals.reduce((acc, g) => acc + (g.monthly_contribution || 0), 0);
  const unallocatedSurplus = Math.max(0, freeCashFlow - totalGoalCommitments);

  const monthlyOutflows = fixed + discretionary + debt;
  const bufferRunwayMonths = monthlyOutflows > 0 ? (emergencyFund / monthlyOutflows).toFixed(1) : "—";

  // Percentages of Net Income
  const fixedPct = income > 0 ? (fixed / income) * 100 : 0;
  const debtPct = income > 0 ? (debt / income) * 100 : 0;
  const discPct = income > 0 ? (discretionary / income) * 100 : 0;
  const goalPct = income > 0 ? (totalGoalCommitments / income) * 100 : 0;
  const surplusPct = income > 0 ? Math.max(0, 100 - (fixedPct + debtPct + discPct + goalPct)) : 0;

  // Trajectory points for Primary Goal
  const horizonMonths = primaryGoal?.target_months || 24;
  const step = Math.max(1, Math.floor(horizonMonths / 12));
  
  const trajectoryData: Array<{
    month: string;
    monthNum: number;
    balance: number;
    target: number;
  }> = [];

  if (primaryGoal) {
    const currentBal = primaryGoal.current_balance || 0;
    const monthlySip = primaryGoal.monthly_contribution || 0;
    const targetAmt = primaryGoal.target_amount || 0;

    for (let m = 0; m <= horizonMonths; m += step) {
      trajectoryData.push({
        month: `M${m}`,
        monthNum: m,
        balance: Math.round(currentBal + m * monthlySip),
        target: targetAmt,
      });
    }
    // Ensure final month is included
    if (trajectoryData.length > 0 && trajectoryData[trajectoryData.length - 1].monthNum !== horizonMonths) {
      trajectoryData.push({
        month: `M${horizonMonths}`,
        monthNum: horizonMonths,
        balance: Math.round(currentBal + horizonMonths * monthlySip),
        target: targetAmt,
      });
    }
  }

  const formatYAxis = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
    return `₹${val}`;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TrajectoryTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0];
    const val = item?.value || 0;
    const target = primaryGoal?.target_amount || 0;
    const pct = target > 0 ? Math.min(100, (val / target) * 100) : 0;

    return (
      <div className="bg-[#0f172a]/95 text-white p-3 rounded-xl shadow-soft-lg border border-slate-700/60 backdrop-blur-md text-xs space-y-1.5 min-w-[180px]">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-700/60 text-[11px] font-display font-semibold text-slate-300">
          <span>Timeline: {label}</span>
          <span className="text-emerald-400 font-bold">{pct.toFixed(0)}% Target</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400">Cumulative Savings:</span>
          <span className="font-bold font-display text-white tabular-nums">{formatINR(val)}</span>
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-400">
          <span>Target Milestone:</span>
          <span className="font-display text-slate-300 tabular-nums">{formatINR(target)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-soft-sm space-y-6">
      {/* Header with High-Level Solvency Verdict */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 text-[10px] font-display font-bold uppercase tracking-wider border border-stone-200">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              Executive Overview
            </span>
            {primaryGoal && (
              <span className="text-xs font-display text-stone-500 font-medium">
                {primaryGoal.name}
              </span>
            )}
          </div>
          <h3 className="font-display font-bold text-lg sm:text-xl text-stone-950 tracking-tight">
            Financial Capacity & Goal Accumulation Horizon
          </h3>
          <p className="text-xs text-stone-500">
            Real-time monthly cash flow distribution vs. forward-looking milestone trajectory
          </p>
        </div>

        {/* 3-Second Key Badges */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-[10px] font-display font-bold uppercase text-stone-400 tracking-wider">
              LIQUID RUNWAY
            </div>
            <div className="text-lg font-display font-bold text-stone-950 tabular-nums">
              {bufferRunwayMonths} <span className="text-xs font-medium text-stone-500">Months</span>
            </div>
          </div>
          <div className="w-px h-8 bg-stone-200 hidden sm:block" />
          <Link
            href="/survival"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-display font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 transition-colors"
          >
            Full Map <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 2-Column Split: Cash Flow Allocation (Left) + Goal Trajectory (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column (5 Cols): Cash Flow Allocation Breakdown */}
        <div className="lg:col-span-5 bg-stone-50/60 rounded-2xl p-5 border border-stone-200/60 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-display font-bold text-stone-900">
                <PieChart className="w-3.5 h-3.5 text-stone-600" />
                <span>Monthly Cash Flow Capacity</span>
              </div>
              <span className="text-xs font-display font-bold text-stone-900 tabular-nums">
                {formatINR(income)} <span className="text-[10px] font-normal text-stone-500">Take-Home</span>
              </span>
            </div>

            {/* Segmented Allocation Bar */}
            <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${fixedPct}%` }}
                className="bg-stone-800 transition-all duration-500"
                title={`Fixed: ${fixedPct.toFixed(0)}%`}
              />
              <div
                style={{ width: `${debtPct}%` }}
                className="bg-amber-600 transition-all duration-500"
                title={`Debt: ${debtPct.toFixed(0)}%`}
              />
              <div
                style={{ width: `${discPct}%` }}
                className="bg-stone-400 transition-all duration-500"
                title={`Discretionary: ${discPct.toFixed(0)}%`}
              />
              <div
                style={{ width: `${goalPct}%` }}
                className="bg-emerald-600 transition-all duration-500"
                title={`Goal Commitments: ${goalPct.toFixed(0)}%`}
              />
              <div
                style={{ width: `${surplusPct}%` }}
                className="bg-emerald-300 transition-all duration-500"
                title={`Free Surplus: ${surplusPct.toFixed(0)}%`}
              />
            </div>

            {/* Segment Breakdown Legend */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between text-stone-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-stone-800 shrink-0" />
                  <span>Fixed Obligations ({fixedPct.toFixed(0)}%)</span>
                </span>
                <span className="font-display font-medium tabular-nums text-stone-900">
                  {formatINR(fixed)}
                </span>
              </div>

              <div className="flex items-center justify-between text-stone-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
                  <span>Debt / EMIs ({debtPct.toFixed(0)}%)</span>
                </span>
                <span className="font-display font-medium tabular-nums text-stone-900">
                  {formatINR(debt)}
                </span>
              </div>

              <div className="flex items-center justify-between text-stone-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-stone-400 shrink-0" />
                  <span>Discretionary ({discPct.toFixed(0)}%)</span>
                </span>
                <span className="font-display font-medium tabular-nums text-stone-900">
                  {formatINR(discretionary)}
                </span>
              </div>

              <div className="flex items-center justify-between text-emerald-900 font-semibold pt-1 border-t border-stone-200/80">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                  <span>Goal SIPs ({goalPct.toFixed(0)}%)</span>
                </span>
                <span className="font-display font-bold tabular-nums text-emerald-800">
                  {formatINR(totalGoalCommitments)}
                </span>
              </div>

              <div className="flex items-center justify-between text-emerald-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 shrink-0" />
                  <span>Unallocated Buffer ({surplusPct.toFixed(0)}%)</span>
                </span>
                <span className="font-display font-medium tabular-nums text-emerald-700">
                  {formatINR(unallocatedSurplus)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Cushion Summary */}
          <div className="p-3 bg-white rounded-xl border border-stone-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-stone-700">
              <Wallet className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Liquid Emergency Buffer:</span>
            </div>
            <span className="font-display font-bold text-stone-950 tabular-nums">
              {formatINR(emergencyFund)}
            </span>
          </div>
        </div>

        {/* Right Column (7 Cols): Primary Goal Trajectory Curve */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200/80 p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="font-display font-bold text-sm text-stone-950">
                Goal Horizon Trajectory
              </h4>
              <p className="text-[11px] text-stone-500">
                Projected cumulative savings vs. target milestone in INR (₹)
              </p>
            </div>
            {primaryGoal && (
              <span className="text-xs font-display font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                M{primaryGoal.target_months} Target
              </span>
            )}
          </div>

          {/* Mini Chart Canvas */}
          {primaryGoal && trajectoryData.length > 0 ? (
            <div className="w-full h-52 relative min-h-[208px]">
              <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <ComposedChart data={trajectoryData} margin={{ top: 12, right: 15, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashboardTrajectoryGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f0ea" />

                  <XAxis
                    dataKey="month"
                    axisLine={{ stroke: "#e7e5e4" }}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#78716c" }}
                    dy={4}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#78716c" }}
                    tickFormatter={formatYAxis}
                    dx={-2}
                  />

                  <Tooltip content={<TrajectoryTooltip />} />

                  {/* Target Corpus Reference Line */}
                  <ReferenceLine
                    y={primaryGoal.target_amount}
                    stroke="#64748b"
                    strokeDasharray="3 3"
                    strokeWidth={1.5}
                    label={{
                      value: `Target (${formatYAxis(primaryGoal.target_amount)})`,
                      fill: "#475569",
                      fontSize: 9,
                      position: "insideTopRight",
                      fontWeight: 600,
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="balance"
                    fill="url(#dashboardTrajectoryGrad)"
                    stroke="none"
                    isAnimationActive={false}
                    style={{ pointerEvents: "none" }}
                  />

                  <Line
                    type="monotone"
                    dataKey="balance"
                    name="Projected Balance"
                    stroke="#059669"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: "#059669", stroke: "#ffffff", strokeWidth: 2 }}
                    isAnimationActive={true}
                    animationDuration={600}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-52 flex flex-col items-center justify-center text-center p-6 text-stone-400 space-y-2 bg-stone-50 rounded-xl">
              <TrendingUp className="w-6 h-6 text-stone-300" />
              <p className="text-xs font-display font-medium text-stone-600">
                No active target goal selected
              </p>
              <p className="text-[11px] text-stone-400 max-w-xs">
                Create a goal or load demo scenarios to visualize your multi-month accumulation path.
              </p>
            </div>
          )}

          {/* Quick Metrics Footer */}
          {primaryGoal && (
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100 text-center text-xs">
              <div className="p-1.5 bg-stone-50 rounded-lg">
                <div className="text-[10px] text-stone-400 font-display uppercase">Current Corpus</div>
                <div className="font-display font-bold text-stone-900 tabular-nums">
                  {formatINR(primaryGoal.current_balance)}
                </div>
              </div>
              <div className="p-1.5 bg-stone-50 rounded-lg">
                <div className="text-[10px] text-stone-400 font-display uppercase">Monthly SIP</div>
                <div className="font-display font-bold text-emerald-800 tabular-nums">
                  {formatINR(primaryGoal.monthly_contribution || 0)}
                </div>
              </div>
              <div className="p-1.5 bg-stone-50 rounded-lg">
                <div className="text-[10px] text-stone-400 font-display uppercase">Target Goal</div>
                <div className="font-display font-bold text-stone-900 tabular-nums">
                  {formatINR(primaryGoal.target_amount)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
