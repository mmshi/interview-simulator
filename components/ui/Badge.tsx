import type { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "success" | "danger" | "accent";
}

const TONE_CLASSES: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "bg-slate-800 text-slate-300 border-slate-700",
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  danger: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  accent: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
};

export function Badge({ tone = "neutral", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ${TONE_CLASSES[tone]} ${className}`}
      {...props}
    />
  );
}
