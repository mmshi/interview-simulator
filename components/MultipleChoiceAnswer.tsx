import type { MultipleChoiceOption } from "@/lib/types";

interface MultipleChoiceAnswerProps {
  options: MultipleChoiceOption[];
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
}

export function MultipleChoiceAnswer({ options, selectedOptionId, onSelect }: MultipleChoiceAnswerProps) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onSelect(option.id)}
          className={`rounded-lg border p-3 text-left text-sm transition-colors ${
            selectedOptionId === option.id
              ? "border-indigo-500 bg-indigo-500/10 text-indigo-100"
              : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600"
          }`}
        >
          {option.text}
        </button>
      ))}
    </div>
  );
}
