export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" aria-hidden="true" />
      <span className="text-sm font-semibold tracking-tight text-slate-900">Interview Simulator</span>
    </span>
  );
}
