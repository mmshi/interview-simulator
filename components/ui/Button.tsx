import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm disabled:bg-slate-300 disabled:shadow-none",
  secondary:
    "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 disabled:opacity-50",
  ghost: "bg-transparent hover:bg-slate-100 text-slate-600 disabled:opacity-50",
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
