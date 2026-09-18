import React from "react";
import { ResilienceGrade } from "@/types/api";

interface BadgeProps {
  grade?: ResilienceGrade | string;
  children?: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export function Badge({ grade, children, variant, className = "" }: BadgeProps) {
  let colorStyles = "bg-stone-100/90 text-stone-700 border-stone-200/80";
  let dotColor = "bg-stone-400";

  if (grade === "ROBUST" || grade === "HEALTHY" || variant === "success") {
    colorStyles = "bg-emerald-50 text-emerald-800 border-emerald-200/70";
    dotColor = "bg-emerald-500";
  } else if (grade === "MODERATE" || grade === "MODERATE_RISK" || variant === "info") {
    colorStyles = "bg-sky-50 text-sky-800 border-sky-200/70";
    dotColor = "bg-sky-500";
  } else if (grade === "VULNERABLE" || variant === "warning") {
    colorStyles = "bg-amber-50 text-amber-800 border-amber-200/70";
    dotColor = "bg-amber-500";
  } else if (grade === "CRITICAL" || grade === "AT_RISK" || variant === "danger") {
    colorStyles = "bg-rose-50 text-rose-800 border-rose-200/70";
    dotColor = "bg-rose-500";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-tight border ${colorStyles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      <span>{children || grade}</span>
    </span>
  );
}
