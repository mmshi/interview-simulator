import { Badge } from "@/components/ui/Badge";
import type { StarBreakdown as StarBreakdownType } from "@/lib/types";

const COVERAGE_TONE: Record<StarBreakdownType["overallCoverage"], "success" | "neutral" | "danger"> = {
  strong: "success",
  partial: "neutral",
  none: "danger",
};

export function StarBreakdown({ star }: { star: StarBreakdownType }) {
  const rows: { label: string; value: StarBreakdownType["situation"] }[] = [
    { label: "Situation", value: star.situation },
    { label: "Task", value: star.task },
    { label: "Action", value: star.action },
    { label: "Result", value: star.result },
  ];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          STAR Coverage
        </h3>
        <Badge tone={COVERAGE_TONE[star.overallCoverage]}>{star.overallCoverage}</Badge>
      </div>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                row.value.present ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
              }`}
            >
              {row.value.present ? "✓" : "–"}
            </span>
            <div>
              <div className="text-sm font-medium text-slate-800">{row.label}</div>
              <div className="text-xs text-slate-500">{row.value.comment}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
