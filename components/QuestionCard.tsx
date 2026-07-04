import { Card } from "@/components/ui/Card";
import type { Question } from "@/lib/types";

export function QuestionCard({ question }: { question: Question }) {
  return (
    <Card>
      <p className="text-lg leading-relaxed text-slate-100">{question.prompt}</p>
      {question.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {question.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
