"use client";

import React, { useState } from "react";
import { AssumptionLedger as LedgerType } from "@/types/api";
import { formatINR, formatPercent } from "@/lib/utils";
import { ClipboardList, ChevronDown, ChevronUp, ShieldCheck, Info } from "lucide-react";

interface AssumptionLedgerProps {
  ledger?: LedgerType;
  className?: string;
  defaultOpen?: boolean;
}

export function AssumptionLedger({
  ledger,
  className = "",
  defaultOpen = false,
}: AssumptionLedgerProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!ledger) return null;

  return (
    <div className={`rounded-xl border border-slate-200 bg-slate-50/50 transition-all ${className}`}>
      {/* Toggle Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-100/50 transition-colors rounded-xl"
      >
        <div className="flex items-center gap-2.5">
          <ClipboardList className="w-4 h-4 text-slate-500" />
          <div>
            <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">
              Financial Assumptions Ledger
            </span>
            <span className="ml-2 text-[11px] text-slate-500 font-normal">
              ({ledger.shocks_count} active {ledger.shocks_count === 1 ? "shock" : "shocks"}, {ledger.simulation_horizon_months} mo horizon)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span>{isOpen ? "Collapse" : "Inspect Parameters"}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="p-4 pt-0 border-t border-slate-200/80 space-y-4 text-xs">
          <div className="pt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              All values are verified baseline inputs used by the deterministic Python calculation engine.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Income & Expense Breakdown */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
              <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider pb-1 border-b border-slate-100">
                Monthly Cash Flow Baseline
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Net Monthly Income:</span>
                <span className="font-mono font-semibold text-slate-900">{formatINR(ledger.monthly_net_income)}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Fixed Living Expenses:</span>
                <span className="font-mono text-slate-700">{formatINR(ledger.total_fixed_expenses)}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Discretionary Expenses:</span>
                <span className="font-mono text-slate-700">{formatINR(ledger.total_discretionary_expenses)}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Debt Servicing (EMIs):</span>
                <span className="font-mono text-slate-700">{formatINR(ledger.total_debt_payments)}</span>
              </div>
              <div className="flex justify-between py-0.5 pt-1.5 border-t border-slate-100">
                <span className="text-slate-600 font-medium">Emergency Fund Balance:</span>
                <span className="font-mono font-bold text-emerald-700">{formatINR(ledger.emergency_fund_balance)}</span>
              </div>
            </div>

            {/* Goal Commitment Parameters */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
              <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider pb-1 border-b border-slate-100">
                Goal Parameters ({ledger.goal_name})
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Target Capital Amount:</span>
                <span className="font-mono font-semibold text-slate-900">{formatINR(ledger.goal_target_amount)}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Initial Starting Balance:</span>
                <span className="font-mono text-slate-700">{formatINR(ledger.goal_initial_balance)}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Target Completion Horizon:</span>
                <span className="font-mono text-slate-700">{ledger.goal_target_months} Months</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Base Required Monthly Contribution:</span>
                <span className="font-mono font-bold text-slate-900">{formatINR(ledger.base_monthly_contribution)}/mo</span>
              </div>
              <div className="flex justify-between py-0.5 pt-1.5 border-t border-slate-100">
                <span className="text-slate-600 font-medium">Simulation Horizon:</span>
                <span className="font-mono text-slate-700">{ledger.simulation_horizon_months} Months</span>
              </div>
            </div>
          </div>

          {/* Active Shocks Ledger */}
          {ledger.shocks_applied && ledger.shocks_applied.length > 0 && (
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
              <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider pb-1 border-b border-slate-100">
                Active Stress-Test Shocks ({ledger.shocks_applied.length})
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-medium">
                      <th className="py-1 px-2">Shock Type</th>
                      <th className="py-1 px-2">Timeline</th>
                      <th className="py-1 px-2">Duration</th>
                      <th className="py-1 px-2">Magnitude / Amount</th>
                      <th className="py-1 px-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ledger.shocks_applied.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-1.5 px-2 font-mono font-semibold text-slate-800 uppercase">
                          {s.shock_type.replace(/_/g, " ")}
                        </td>
                        <td className="py-1.5 px-2 font-mono text-slate-600">Month {s.start_month}</td>
                        <td className="py-1.5 px-2 font-mono text-slate-600">{s.duration_months} mo</td>
                        <td className="py-1.5 px-2 font-mono text-rose-600 font-semibold">
                          {s.amount ? formatINR(s.amount) : s.magnitude_percent ? formatPercent(s.magnitude_percent * 100) : "N/A"}
                        </td>
                        <td className="py-1.5 px-2 text-slate-500">{s.description || "Simulated disruption"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
