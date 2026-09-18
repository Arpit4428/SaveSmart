import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  RefreshCw,
  Target,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Flame,
  PieChart,
  Layers,
  Activity,
  Cpu,
  Lock,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="space-y-24 sm:space-y-32 max-w-6xl mx-auto py-6 sm:py-12">
      {/* 1. HERO SECTION */}
      <section className="text-center space-y-8 pt-6 sm:pt-12 pb-8 border-b border-stone-200/80">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-200/50 border border-stone-300/70 text-[11px] font-display text-stone-700 tracking-wider uppercase font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 animate-pulse" />
          <span>Financial Resilience & Goal Stress-Testing Platform</span>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          <div className="font-display font-black text-xs sm:text-sm tracking-[0.25em] uppercase text-stone-400">
            SAVE SMART
          </div>
          <h1 className="font-serif italic text-4xl sm:text-6xl lg:text-7xl text-stone-950 leading-[1.06] tracking-tight">
            Stress-test your financial goals <br />
            <span className="not-italic font-display font-semibold text-stone-900 text-3xl sm:text-5xl lg:text-6xl">
              before you commit.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto font-sans leading-relaxed pt-2">
            The deterministic resilience engine for Indian household capital. Calculate cashflow shock survival, cascade vulnerability, and algorithmic recovery pathways before reality tests them for you.
          </p>
        </div>

        {/* Primary Action */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2.5 px-8 py-4 text-sm sm:text-base font-display font-semibold text-white bg-stone-950 hover:bg-stone-800 rounded-full shadow-soft transition-all active:scale-[0.98] group"
          >
            <span>Enter SaveSmart</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-6 py-4 text-sm font-display font-semibold text-stone-700 bg-white hover:bg-stone-100/80 border border-stone-300/80 rounded-full shadow-soft-sm transition-all"
          >
            Explore How It Works
          </a>
        </div>

        {/* Feature Badges */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-display text-stone-600">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            100% Deterministic Engine
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Zero AI Math Hallucinations
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            5-Axis Resilience Fingerprint
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Calibrated for INR (₹)
          </span>
        </div>
      </section>

      {/* 2. WHAT IS SAVESMART? (Editorial Contrast) */}
      <section className="space-y-10">
        <div className="max-w-2xl">
          <div className="text-[11px] font-display font-bold uppercase tracking-widest text-stone-400 mb-2">
            The Problem
          </div>
          <h2 className="font-serif italic text-3xl sm:text-4xl text-stone-950 tracking-tight leading-snug">
            Why conventional goal tracking fails when life happens.
          </h2>
          <p className="text-sm sm:text-base text-stone-600 font-sans mt-3 leading-relaxed">
            Standard budgeting apps assume constant employment, flat inflation, and zero emergencies. They compute simple linear projections that collapse at the first real shock.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Traditional Trackers Card */}
          <div className="rounded-3xl border border-rose-200/80 bg-rose-50/40 p-8 space-y-4">
            <div className="flex items-center gap-2 text-rose-700 font-display font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Generic Goal Trackers</span>
            </div>
            <h3 className="text-lg font-display font-bold text-stone-900">
              Fragile, optimistic linear math
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-stone-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold mt-0.5">✕</span>
                <span>Assumes zero income disruptions or job loss gaps.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold mt-0.5">✕</span>
                <span>Ignores sudden capital shocks (medical emergencies, market dips).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold mt-0.5">✕</span>
                <span>Fails to provide mathematical recovery blueprints when targets derail.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold mt-0.5">✕</span>
                <span>Treats monthly contributions as guaranteed without verifying true Free Cash Flow.</span>
              </li>
            </ul>
          </div>

          {/* SaveSmart Engine Card */}
          <div className="rounded-3xl border border-emerald-200/80 bg-emerald-50/40 p-8 space-y-4">
            <div className="flex items-center gap-2 text-emerald-800 font-display font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>SaveSmart Deterministic Engine</span>
            </div>
            <h3 className="text-lg font-display font-bold text-stone-900">
              Verified resilience & shock simulation
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-stone-700 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold mt-0.5">✓</span>
                <span>Simulates multi-month job loss, inflation spikes, and medical drain.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold mt-0.5">✓</span>
                <span>Determines exact depletion horizons and survival safe zones.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold mt-0.5">✓</span>
                <span>Generates 3 mathematical recovery options (Aggressive, Balanced, Extended).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold mt-0.5">✓</span>
                <span>Deterministic Python calculations paired with zero-hallucination Gemini explanations.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (Sequential 5-Step Pipeline) */}
      <section id="how-it-works" className="space-y-12 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="text-[11px] font-display font-bold uppercase tracking-widest text-stone-400">
            System Workflow
          </div>
          <h2 className="font-serif italic text-3xl sm:text-5xl text-stone-950 tracking-tight">
            How SaveSmart Works
          </h2>
          <p className="text-sm text-stone-600">
            A continuous, five-stage analytical pipeline designed to test and protect household capital.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-6">
          {/* Step 1 */}
          <div className="rounded-3xl border border-stone-200/80 bg-white p-6 space-y-4 shadow-soft-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-stone-100 flex items-center justify-center font-display font-bold text-sm text-stone-900">
                01
              </div>
              <h3 className="font-display font-bold text-base text-stone-950">Build</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Define your target corpus, timeline in months, initial capital, and monthly commitment in INR.
              </p>
            </div>
            <div className="text-[10px] font-display font-semibold uppercase text-stone-400 tracking-wider pt-2 border-t border-stone-100">
              Goal Builder
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-3xl border border-stone-200/80 bg-white p-6 space-y-4 shadow-soft-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-stone-100 flex items-center justify-center font-display font-bold text-sm text-stone-900">
                02
              </div>
              <h3 className="font-display font-bold text-base text-stone-950">Baseline</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Audit monthly take-home income, fixed obligations, debt EMIs, and emergency reserves to compute true Net Free Cash Flow.
              </p>
            </div>
            <div className="text-[10px] font-display font-semibold uppercase text-stone-400 tracking-wider pt-2 border-t border-stone-100">
              Cash Flow Engine
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-3xl border border-stone-200/80 bg-white p-6 space-y-4 shadow-soft-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center font-display font-bold text-sm">
                03
              </div>
              <h3 className="font-display font-bold text-base text-stone-950">Stress Test</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Subject your plan to single disruptions or compound cascades: 3-month income loss, 15% inflation, and medical costs.
              </p>
            </div>
            <div className="text-[10px] font-display font-semibold uppercase text-stone-400 tracking-wider pt-2 border-t border-stone-100">
              Stress-Test Lab
            </div>
          </div>

          {/* Step 4 */}
          <div className="rounded-3xl border border-stone-200/80 bg-white p-6 space-y-4 shadow-soft-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-stone-100 flex items-center justify-center font-display font-bold text-sm text-stone-900">
                04
              </div>
              <h3 className="font-display font-bold text-base text-stone-950">Understand</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Analyze multi-month survival curves, depletion horizons, and receive plain-English Gemini diagnostics of verified data.
              </p>
            </div>
            <div className="text-[10px] font-display font-semibold uppercase text-stone-400 tracking-wider pt-2 border-t border-stone-100">
              Survival Map & AI
            </div>
          </div>

          {/* Step 5 */}
          <div className="rounded-3xl border border-stone-200/80 bg-white p-6 space-y-4 shadow-soft-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-display font-bold text-sm">
                05
              </div>
              <h3 className="font-display font-bold text-base text-stone-950">Recover</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Generate 3 deterministic recovery paths: Aggressive (boost SIP), Balanced (optimized delay), or Extended timeline.
              </p>
            </div>
            <div className="text-[10px] font-display font-semibold uppercase text-stone-400 tracking-wider pt-2 border-t border-stone-100">
              Recovery Simulator
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRODUCT CAPABILITIES (Core Features Grid) */}
      <section className="space-y-10">
        <div className="max-w-2xl">
          <div className="text-[11px] font-display font-bold uppercase tracking-widest text-stone-400 mb-2">
            Analytical Capabilities
          </div>
          <h2 className="font-serif italic text-3xl sm:text-4xl text-stone-950 tracking-tight">
            Engineered for thorough financial verification.
          </h2>
          <p className="text-sm text-stone-600 mt-2">
            Every feature is backed by deterministic math running in a dedicated backend engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="rounded-3xl border border-stone-200/80 bg-white p-7 space-y-3.5 shadow-soft-sm">
            <div className="p-3 rounded-2xl bg-stone-100 text-stone-800 w-fit">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-stone-950">
              Goal Health & Free Cash Flow Verification
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Instantly assesses whether your monthly savings commitments violate your verified Free Cash Flow capacity or emergency cushion.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-3xl border border-stone-200/80 bg-white p-7 space-y-3.5 shadow-soft-sm">
            <div className="p-3 rounded-2xl bg-rose-50 text-rose-700 w-fit">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-stone-950">
              Deterministic Stress-Test Lab
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Inject controlled financial shocks (job loss, inflation, emergency medical expenses) and measure exact delay impact in months and rupees.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-3xl border border-stone-200/80 bg-white p-7 space-y-3.5 shadow-soft-sm">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 w-fit">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-stone-950">
              Goal Survival Map & Trajectories
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Visualizes baseline vs stressed trajectory curves month-by-month, mapping safe zones, vulnerability thresholds, and depletion dates.
            </p>
          </div>

          {/* Card 4 */}
          <div className="rounded-3xl border border-stone-200/80 bg-white p-7 space-y-3.5 shadow-soft-sm">
            <div className="p-3 rounded-2xl bg-stone-100 text-stone-800 w-fit">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-stone-950">
              Compound Cascade Mode
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Simulate compounding multi-shock events (e.g. 4-month job loss + ₹1,50,000 medical crisis simultaneously) to reveal hidden failure points.
            </p>
          </div>

          {/* Card 5 */}
          <div className="rounded-3xl border border-stone-200/80 bg-white p-7 space-y-3.5 shadow-soft-sm">
            <div className="p-3 rounded-2xl bg-stone-100 text-stone-800 w-fit">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-stone-950">
              Adaptive Recovery Simulator
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Algorithms compute 3 exact recovery blueprints: boost monthly contributions, accept minimal deadline extension, or a balanced hybrid.
            </p>
          </div>

          {/* Card 6 */}
          <div className="rounded-3xl border border-stone-200/80 bg-white p-7 space-y-3.5 shadow-soft-sm">
            <div className="p-3 rounded-2xl bg-stone-100 text-stone-800 w-fit">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-stone-950">
              5-Axis Resilience Fingerprint
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Scores household resilience across 5 core pillars: Emergency Buffer, Cashflow Margin, Shock Absorption, Recovery Agility, and Goal Feasibility.
            </p>
          </div>
        </div>
      </section>

      {/* 5. PRODUCT PRINCIPLES / CREDENTIALS */}
      <section className="rounded-3xl border border-stone-200/80 bg-white p-8 sm:p-12 space-y-8 shadow-soft-sm">
        <div className="max-w-2xl space-y-2">
          <div className="text-[11px] font-display font-bold uppercase tracking-widest text-emerald-800">
            System Integrity
          </div>
          <h2 className="font-serif italic text-3xl sm:text-4xl text-stone-950 tracking-tight">
            Our Architectural Commitments
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            SaveSmart is designed around absolute mathematical rigor, transparency, and Indian household realities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 border-t border-stone-100">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-stone-900 font-display font-bold text-sm">
              <Cpu className="w-4 h-4 text-emerald-700" />
              <span>100% Deterministic Engine</span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              All financial formulas, depletion horizons, and recovery schedules are computed strictly in Python backend services with zero rounding ambiguity.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-stone-900 font-display font-bold text-sm">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Zero AI Math Hallucinations</span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Gemini AI is strictly an explanation layer. It synthesizes and explains verified deterministic engine calculations without calculating or modifying values.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-stone-900 font-display font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Indian Financial Standard</span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Engine and UI natively format in Indian Rupees (₹ / INR), respecting Indian family emergency fund requirements and realistic SIP increments.
            </p>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CALL TO ACTION */}
      <section className="rounded-3xl bg-stone-950 text-stone-100 p-8 sm:p-14 text-center space-y-6 shadow-soft">
        <div className="space-y-3 max-w-2xl mx-auto">
          <h2 className="font-serif italic text-3xl sm:text-5xl text-white tracking-tight">
            Stress-test your financial resilience now.
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
            Verify whether your home purchase, child education, or emergency cushion can withstand real-world shocks.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2.5 px-8 py-4 text-sm font-display font-semibold text-stone-950 bg-white hover:bg-stone-100 rounded-full shadow-soft transition-all active:scale-[0.98] group"
          >
            <span>Launch SaveSmart Engine</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/stress-test"
            className="inline-flex items-center gap-2 px-6 py-4 text-sm font-display font-semibold text-stone-300 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-full transition-all"
          >
            Open Stress-Test Lab
          </Link>
        </div>
      </section>
    </div>
  );
}
