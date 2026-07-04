import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { StarBreakdown } from "@/components/StarBreakdown";
import type { Feedback } from "@/lib/types";

export function FeedbackPanel({ feedback }: { feedback: Feedback }) {
  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Feedback</h2>
          <Badge tone={feedback.score >= 7 ? "success" : feedback.score >= 4 ? "neutral" : "danger"}>
            Score: {feedback.score}/10
          </Badge>
        </div>
        <p className="text-slate-200">{feedback.summary}</p>
      </Card>

      {feedback.multipleChoiceVerdict && (
        <Card>
          <div className="mb-2 flex items-center gap-2">
            <Badge tone={feedback.multipleChoiceVerdict.correct ? "success" : "danger"}>
              {feedback.multipleChoiceVerdict.correct ? "Correct" : "Not quite"}
            </Badge>
          </div>
          <p className="text-sm text-slate-400">
            You selected: <span className="text-slate-200">{feedback.multipleChoiceVerdict.selectedOptionText}</span>
          </p>
          {!feedback.multipleChoiceVerdict.correct && (
            <p className="mt-1 text-sm text-slate-400">
              Ideal answer: <span className="text-slate-200">{feedback.multipleChoiceVerdict.idealOptionText}</span>
            </p>
          )}
          <p className="mt-3 text-sm text-slate-300">{feedback.multipleChoiceVerdict.explanation}</p>
        </Card>
      )}

      {feedback.star && (
        <Card>
          <StarBreakdown star={feedback.star} />
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-400">
            Strengths
          </h3>
          <ul className="space-y-1.5 text-sm text-slate-300">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-emerald-500">+</span>
                {s}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-400">
            Areas for Improvement
          </h3>
          <ul className="space-y-1.5 text-sm text-slate-300">
            {feedback.improvements.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-amber-500">→</span>
                {s}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
