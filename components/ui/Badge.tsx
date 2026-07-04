import type { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "success" | "danger" | "accent";
}

const TONE_CLASSES: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "bg-slate-100 text-slate-600 border-slate-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  danger: "bg-rose-50 text-rose-700 border-rose-200",
  accent: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

export function Badge({ tone = "neutral", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ${TONE_CLASSES[tone]} ${className}`}
      {...props}
    />
  );
}
