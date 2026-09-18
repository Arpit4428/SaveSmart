import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "SaveSmart — Financial Resilience & Goal Stress-Testing",
  description: "Test your savings goals against real-world shocks with deterministic financial models.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#fafaf9] text-[#09090b] selection:bg-emerald-100 selection:text-emerald-900">
        <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-stone-200/70 transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2.5 group">
                <span className="w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-soft-sm group-hover:bg-emerald-700 transition-colors">
                  SS
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-semibold text-base tracking-tight text-stone-950">
                    SaveSmart
                  </span>
                  <span className="text-[10px] font-mono font-medium text-stone-500 bg-stone-100/80 px-1.5 py-0.5 rounded-md border border-stone-200/60">
                    INR / ₹
                  </span>
                </div>
              </Link>

              <nav className="hidden lg:flex items-center gap-1 bg-stone-100/70 p-1 rounded-full border border-stone-200/60 text-xs font-medium text-stone-600">
                <Link
                  href="/"
                  className="px-3.5 py-1.5 rounded-full hover:text-stone-950 hover:bg-white hover:shadow-soft-sm transition-all"
                >
                  Dashboard
                </Link>
                <Link
                  href="/goals"
                  className="px-3.5 py-1.5 rounded-full hover:text-stone-950 hover:bg-white hover:shadow-soft-sm transition-all"
                >
                  Goal Builder
                </Link>
                <Link
                  href="/baseline"
                  className="px-3.5 py-1.5 rounded-full hover:text-stone-950 hover:bg-white hover:shadow-soft-sm transition-all"
                >
                  Financial Baseline
                </Link>
                <Link
                  href="/stress-test"
                  className="px-3.5 py-1.5 rounded-full hover:text-stone-950 hover:bg-white hover:shadow-soft-sm transition-all"
                >
                  Stress-Test Lab
                </Link>
                <Link
                  href="/recovery"
                  className="px-3.5 py-1.5 rounded-full hover:text-stone-950 hover:bg-white hover:shadow-soft-sm transition-all"
                >
                  Recovery Planner
                </Link>
                <Link
                  href="/survival"
                  className="px-3.5 py-1.5 rounded-full hover:text-stone-950 hover:bg-white hover:shadow-soft-sm transition-all"
                >
                  Survival Map
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-stone-200/80 shadow-soft-sm text-xs font-medium text-stone-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] text-stone-600">Engine Live</span>
              </div>
            </div>
          </div>

          {/* Mobile Sub-Navigation */}
          <nav className="lg:hidden flex items-center gap-1.5 px-4 py-2 overflow-x-auto border-t border-stone-200/50 text-xs font-medium bg-stone-50/90 no-scrollbar">
            <Link
              href="/"
              className="px-3 py-1 rounded-full bg-white border border-stone-200/70 text-stone-700 whitespace-nowrap shadow-soft-sm"
            >
              Dashboard
            </Link>
            <Link
              href="/goals"
              className="px-3 py-1 rounded-full text-stone-600 hover:text-stone-900 whitespace-nowrap"
            >
              Goal Builder
            </Link>
            <Link
              href="/baseline"
              className="px-3 py-1 rounded-full text-stone-600 hover:text-stone-900 whitespace-nowrap"
            >
              Baseline
            </Link>
            <Link
              href="/stress-test"
              className="px-3 py-1 rounded-full text-stone-600 hover:text-stone-900 whitespace-nowrap"
            >
              Stress-Test
            </Link>
            <Link
              href="/recovery"
              className="px-3 py-1 rounded-full text-stone-600 hover:text-stone-900 whitespace-nowrap"
            >
              Recovery
            </Link>
            <Link
              href="/survival"
              className="px-3 py-1 rounded-full text-stone-600 hover:text-stone-900 whitespace-nowrap"
            >
              Survival Map
            </Link>
          </nav>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {children}
        </main>

        <footer className="border-t border-stone-200/70 bg-white/60 py-8 mt-16 text-center text-xs text-stone-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-900">SaveSmart</span>
              <span className="text-stone-400">·</span>
              <span>Financial Resilience & Goal Stress-Testing Platform</span>
            </div>
            <div className="text-stone-400 text-[11px]">
              Deterministic Python Engine · 100% Math Verification · Indian Rupee (₹)
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
