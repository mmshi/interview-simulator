import { Badge } from "@/components/ui/Badge";

interface ProgressHeaderProps {
  currentIndex: number;
  total: number;
  category: string;
  difficulty: string;
}

export function ProgressHeader({ currentIndex, total, category, difficulty }: ProgressHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        <Badge tone="accent">{category}</Badge>
        <Badge tone="neutral">{difficulty}</Badge>
      </div>
      <span className="text-sm text-slate-400">
        Question {Math.min(currentIndex + 1, total)} of {total}
      </span>
    </div>
  );
}
