import type { AnswerMode } from "@/lib/types";

interface AnswerModeToggleProps {
  mode: AnswerMode;
  onChange: (mode: AnswerMode) => void;
}

export function AnswerModeToggle({ mode, onChange }: AnswerModeToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1">
      {(["free-text", "multiple-choice"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === option
              ? "bg-indigo-600 text-white"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {option === "free-text" ? "Write my answer" : "Multiple choice"}
        </button>
      ))}
    </div>
  );
}
