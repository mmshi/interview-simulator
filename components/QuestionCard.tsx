import { Card } from "@/components/ui/Card";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import type { Question } from "@/lib/types";

export function QuestionCard({ question }: { question: Question }) {
  return (
    <Card>
      <div className="flex gap-4">
        <CategoryIcon category={question.category} />
        <p className="text-lg leading-relaxed text-slate-900">{question.prompt}</p>
      </div>
      {question.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {question.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
