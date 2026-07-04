import type { HTMLAttributes } from "react";

export function StatBlock({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl bg-slate-900 p-4 text-white ${className}`}
      {...props}
    />
  );
}
