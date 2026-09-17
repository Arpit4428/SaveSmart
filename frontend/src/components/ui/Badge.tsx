import React from "react";
import { ResilienceGrade } from "@/types/api";

interface BadgeProps {
  grade?: ResilienceGrade | string;
  children?: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export function Badge({ grade, children, variant, className = "" }: BadgeProps) {
  let colorStyles = "bg-slate-100 text-slate-700 border-slate-200";

  if (grade === "ROBUST" || variant === "success") {
    colorStyles = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (grade === "MODERATE" || variant === "info") {
    colorStyles = "bg-blue-50 text-blue-700 border-blue-200";
  } else if (grade === "VULNERABLE" || variant === "warning") {
    colorStyles = "bg-amber-50 text-amber-700 border-amber-200";
  } else if (grade === "CRITICAL" || variant === "danger") {
    colorStyles = "bg-rose-50 text-rose-700 border-rose-200";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorStyles} ${className}`}
    >
      {children || grade}
    </span>
  );
}
