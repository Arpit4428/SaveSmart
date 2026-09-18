import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, TrendingUp, Activity } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col justify-between max-w-6xl mx-auto py-8 sm:py-16 px-2 sm:px-4 space-y-24 sm:space-y-32">
      {/* ========================================================================= */}
      {/* 1. COVER / ENTRANCE HERO (FIRST VIEWPORT)                                 */}
      {/* ========================================================================= */}
      <section className="flex flex-col items-center text-center space-y-10 sm:space-y-14 pt-4 sm:pt-8">
        {/* Dominant Brand & Display Statement */}
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-200/50 border border-stone-300/60 text-[11px] font-display text-stone-600 tracking-widest uppercase font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 animate-pulse" />
            <span>Financial Resilience Engine</span>
          </div>

          <h1 className="font-display font-extrabold text-5xl sm:text-7xl lg:text-8xl text-stone-950 tracking-tighter leading-none">
            SaveSmart
          </h1>

          <p className="font-serif italic text-2xl sm:text-4xl lg:text-5xl text-stone-800 leading-tight tracking-tight max-w-2xl mx-auto">
            Stress-test your financial goals <br className="hidden sm:inline" />
            <span className="not-italic font-display font-semibold text-stone-900">
              before you commit.
            </span>
          </p>

          <p className="text-sm sm:text-base text-stone-500 max-w-xl mx-auto font-sans leading-relaxed pt-1">
            Simulate job loss, emergency medical shocks, and inflation cascades against your true Free Cash Flow before reality tests them for you.
          </p>
        </div>

        {/* Single Primary Action Button */}
        <div className="pt-1">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-4.5 text-sm sm:text-base font-display font-bold text-white bg-stone-950 hover:bg-stone-800 rounded-full shadow-soft hover:shadow-soft-lg transition-all active:scale-[0.98] group"
          >
            <span>Enter SaveSmart</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* BESPOKE PRODUCT VISUAL: ELEGANT EDITORIAL TRAJECTORY ARTIFACT            */}
        {/* ========================================================================= */}
        <div className="w-full max-w-4xl mx-auto pt-6 sm:pt-10">
          <div className="relative rounded-3xl border border-stone-200/90 bg-white/90 backdrop-blur-sm p-6 sm:p-10 shadow-soft-sm overflow-hidden text-left">
            {/* Visual Header / Telemetry Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-stone-900 text-stone-100 flex items-center justify-center font-display font-bold text-xs">
                  SS
                </div>
                <div>
                  <div className="font-display font-bold text-xs uppercase tracking-wider text-stone-900">
                    Resilience Trajectory Simulation
                  </div>
                  <div className="text-[11px] text-stone-400">
                    Indian Household Capital · ₹25,00,000 Target
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-display font-bold border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  Survival: 94% Viable
                </span>
                <span className="hidden sm:inline-flex text-[11px] font-display text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
                  FCF: ₹65,000/mo
                </span>
              </div>
            </div>

            {/* Trajectory Graphic (Minimal SVG) */}
            <div className="relative w-full h-44 sm:h-56 my-2">
              <svg
                viewBox="0 0 800 220"
                className="w-full h-full overflow-visible"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Subtle Grid Guidelines */}
                <line x1="0" y1="40" x2="800" y2="40" stroke="#f1f0ea" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="100" x2="800" y2="100" stroke="#f1f0ea" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="160" x2="800" y2="160" stroke="#f1f0ea" strokeWidth="1" strokeDasharray="4 4" />

                {/* Target Horizon Line */}
                <line x1="0" y1="25" x2="800" y2="25" stroke="#e5e5dc" strokeWidth="1" />
                <text x="795" y="20" fill="#a8a29e" fontSize="10" fontFamily="sans-serif" textAnchor="end">
                  TARGET CORPUS ₹25L
                </text>

                {/* Shock Window Highlight Box */}
                <rect x="260" y="30" width="180" height="155" rx="8" fill="#fef2f2" fillOpacity="0.7" />
                <text x="350" y="50" fill="#dc2626" fontSize="9" fontWeight="600" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.05em">
                  3-MONTH DISRUPTION WINDOW
                </text>

                {/* Baseline Planned Path (Dotted Neutral) */}
                <path
                  d="M 40 190 Q 300 130 760 30"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                />

                {/* Stressed Dip & Recovery Trajectory (Solid Dark Charcoal + Emerald) */}
                <path
                  d="M 40 190 Q 200 150 270 145 C 320 175, 410 170, 460 140 Q 600 80 760 35"
                  stroke="#0f172a"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Algorithmic Recovery Curve (Emerald) */}
                <path
                  d="M 460 140 Q 580 70 760 30"
                  stroke="#059669"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Coordinate Nodes */}
                <circle cx="40" cy="190" r="4.5" fill="#0f172a" />
                <circle cx="270" cy="145" r="4.5" fill="#e11d48" />
                <circle cx="460" cy="140" r="4.5" fill="#059669" />
                <circle cx="760" cy="30" r="5" fill="#059669" />

                {/* Floating Callout Over Shock */}
                <g transform="translate(240, 105)">
                  <rect width="110" height="26" rx="6" fill="#1e293b" />
                  <text x="55" y="17" fill="#ffffff" fontSize="9" fontWeight="600" fontFamily="sans-serif" textAnchor="middle">
                    Shock: -₹1.2L Deficit
                  </text>
                </g>

                {/* Floating Callout Over Recovery */}
                <g transform="translate(560, 50)">
                  <rect width="125" height="26" rx="6" fill="#065f46" />
                  <text x="62" y="17" fill="#ffffff" fontSize="9" fontWeight="600" fontFamily="sans-serif" textAnchor="middle">
                    Recovery: +₹8.5k/mo SIP
                  </text>
                </g>
              </svg>
            </div>

            {/* Bottom Telemetry Legend */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-100 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-display font-bold text-stone-400">Baseline Target</span>
                <div className="font-display font-semibold text-stone-900">24 Months Timeline</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-display font-bold text-rose-600">Simulated Shock</span>
                <div className="font-display font-semibold text-stone-900">Job Interruption & Medical EMI</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-display font-bold text-emerald-800">Engine Blueprint</span>
                <div className="font-display font-semibold text-stone-900">Solved Balanced Path (+1.5 mo)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. MINIMAL BELOW-FOLD: 3-POINT EDITORIAL SEQUENCE                         */}
      {/* ========================================================================= */}
      <section className="pt-8 border-t border-stone-200/80">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          {/* Pillar 01 */}
          <div className="space-y-2.5">
            <div className="font-display font-bold text-xs uppercase tracking-widest text-stone-400">
              01 / BASELINE AUDIT
            </div>
            <h3 className="font-display font-bold text-base text-stone-950">
              Verify True Free Cash Flow
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              Calculate liquid discretionary capacity after accounting for non-negotiable living expenses, fixed debt EMIs, and emergency reserves.
            </p>
          </div>

          {/* Pillar 02 */}
          <div className="space-y-2.5">
            <div className="font-display font-bold text-xs uppercase tracking-widest text-rose-700">
              02 / SHOCK TESTING
            </div>
            <h3 className="font-display font-bold text-base text-stone-950">
              Inject Compound Disruptions
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              Stress-test savings targets against job loss, inflation spikes, and medical drain to identify depletion dates before they occur.
            </p>
          </div>

          {/* Pillar 03 */}
          <div className="space-y-2.5">
            <div className="font-display font-bold text-xs uppercase tracking-widest text-emerald-800">
              03 / RECOVERY BLUEPRINTS
            </div>
            <h3 className="font-display font-bold text-base text-stone-950">
              Deterministic Recovery Paths
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              Generate 3 exact mathematical blueprints (Aggressive, Balanced, Extended) to restore capital without arithmetic hallucinations.
            </p>
          </div>
        </div>

        {/* Minimal Footer Signature */}
        <div className="pt-12 sm:pt-16 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400 border-t border-stone-100 mt-12">
          <div className="flex items-center gap-2 font-display">
            <span className="font-bold text-stone-800">SaveSmart</span>
            <span>·</span>
            <span>Deterministic Python Engine</span>
            <span>·</span>
            <span>Indian Rupee (₹)</span>
          </div>

          <Link
            href="/dashboard"
            className="font-display font-semibold text-stone-900 hover:text-emerald-800 inline-flex items-center gap-1.5 transition-colors"
          >
            Launch Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
