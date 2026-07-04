import type { QuestionCategory } from "@/lib/types";

const CATEGORY_STYLES: Record<QuestionCategory, { bg: string; fg: string }> = {
  behavioral: { bg: "bg-orange-100", fg: "text-orange-600" },
  case: { bg: "bg-blue-100", fg: "text-blue-600" },
  situational: { bg: "bg-violet-100", fg: "text-violet-600" },
};

function CategoryGlyph({ category, className }: { category: QuestionCategory; className?: string }) {
  switch (category) {
    case "behavioral":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
          <path d="M5.5 19c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case "case":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <rect x="4.5" y="8" width="15" height="10" rx="2" stroke="currentColor" strokeWidth="1.7" />
          <path d="M9 8V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5V8" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      );
    case "situational":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path d="M12 4v3M12 17v3M4 12h3M17 12h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      );
  }
}

export function CategoryIcon({ category, className = "" }: { category: QuestionCategory; className?: string }) {
  const style = CATEGORY_STYLES[category];
  return (
    <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.bg} ${className}`}>
      <CategoryGlyph category={category} className={`h-4.5 w-4.5 ${style.fg}`} />
    </span>
  );
}
