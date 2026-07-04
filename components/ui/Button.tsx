import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/20 disabled:bg-slate-700 disabled:shadow-none",
  secondary:
    "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 disabled:opacity-50",
  ghost: "bg-transparent hover:bg-slate-800 text-slate-300 disabled:opacity-50",
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
