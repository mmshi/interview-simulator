export type QuestionCategory = "behavioral" | "case" | "situational";
export type Difficulty = "easy" | "medium" | "hard";
export type PracticeMode = "generic" | "job-description";
export type AnswerMode = "free-text" | "multiple-choice";

export interface MultipleChoiceOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  category: QuestionCategory;
  difficulty: Difficulty;
  prompt: string;
  isStarRelevant: boolean;
  multipleChoice: {
    options: MultipleChoiceOption[];
    idealOptionId: string;
    rationale: string;
  };
  tags: string[];
}

export type SubmittedAnswer =
  | { questionId: string; mode: "free-text"; freeText: string }
  | { questionId: string; mode: "multiple-choice"; selectedOptionId: string };

export interface StarBreakdown {
  situation: { present: boolean; comment: string };
  task: { present: boolean; comment: string };
  action: { present: boolean; comment: string };
  result: { present: boolean; comment: string };
  overallCoverage: "none" | "partial" | "strong";
}

export interface MultipleChoiceVerdict {
  correct: boolean;
  selectedOptionText: string;
  idealOptionText: string;
  explanation: string;
}

export interface Feedback {
  summary: string;
  strengths: string[];
  improvements: string[];
  score: number;
  star: StarBreakdown | null;
  multipleChoiceVerdict: MultipleChoiceVerdict | null;
}

export interface CandidateProfile {
  industry: string | null;
  experienceLevel: string | null;
  careerGoals: string | null;
}

export type JobDescriptionResult =
  | { status: "fetched"; text: string; sourceUrl: string; truncated: boolean }
  | { status: "text"; text: string }
  | {
      status: "fetch-failed";
      reason:
        | "invalid-url"
        | "blocked-host"
        | "dns-failed"
        | "timeout"
        | "http-error"
        | "too-large"
        | "non-html"
        | "empty-content"
        | "network-error";
      message: string;
    };
