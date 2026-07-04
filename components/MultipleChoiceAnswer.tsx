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
              ? "border-indigo-500 bg-indigo-50 text-indigo-900"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
          }`}
        >
          {option.text}
        </button>
      ))}
    </div>
  );
}
