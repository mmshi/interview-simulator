"use client";

import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react";
import type {
  Difficulty,
  Feedback,
  PracticeMode,
  Question,
  QuestionCategory,
  SubmittedAnswer,
} from "@/lib/types";

type Status =
  | "idle"
  | "loading-questions"
  | "ready"
  | "submitting-answer"
  | "showing-feedback"
  | "error";

interface SessionConfig {
  mode: PracticeMode;
  category: QuestionCategory;
  difficulty: Difficulty;
  jobDescriptionText: string | null;
}

interface SessionState {
  config: SessionConfig | null;
  questions: Question[];
  currentIndex: number;
  answers: Record<string, SubmittedAnswer>;
  feedbackByQuestionId: Record<string, Feedback>;
  status: Status;
  error: string | null;
}

type Action =
  | { type: "START_SESSION"; config: SessionConfig }
  | { type: "QUESTIONS_LOADED"; questions: Question[] }
  | { type: "SUBMIT_ANSWER_START"; answer: SubmittedAnswer }
  | { type: "FEEDBACK_RECEIVED"; questionId: string; feedback: Feedback }
  | { type: "NEXT_QUESTION" }
  | { type: "ERROR"; message: string }
  | { type: "RESET" };

const initialState: SessionState = {
  config: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  feedbackByQuestionId: {},
  status: "idle",
  error: null,
};

function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case "START_SESSION":
      return {
        ...initialState,
        config: action.config,
        status: "loading-questions",
      };
    case "QUESTIONS_LOADED":
      return {
        ...state,
        questions: action.questions,
        currentIndex: 0,
        status: "ready",
      };
    case "SUBMIT_ANSWER_START":
      return {
        ...state,
        answers: { ...state.answers, [action.answer.questionId]: action.answer },
        status: "submitting-answer",
      };
    case "FEEDBACK_RECEIVED":
      return {
        ...state,
        feedbackByQuestionId: {
          ...state.feedbackByQuestionId,
          [action.questionId]: action.feedback,
        },
        status: "showing-feedback",
      };
    case "NEXT_QUESTION":
      return {
        ...state,
        currentIndex: state.currentIndex + 1,
        status: "ready",
      };
    case "ERROR":
      return { ...state, status: "error", error: action.message };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const SessionStateContext = createContext<SessionState | null>(null);
const SessionDispatchContext = createContext<Dispatch<Action> | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <SessionStateContext.Provider value={state}>
      <SessionDispatchContext.Provider value={dispatch}>
        {children}
      </SessionDispatchContext.Provider>
    </SessionStateContext.Provider>
  );
}

export function useSessionState() {
  const context = useContext(SessionStateContext);
  if (!context) throw new Error("useSessionState must be used within SessionProvider");
  return context;
}

export function useSessionDispatch() {
  const context = useContext(SessionDispatchContext);
  if (!context) throw new Error("useSessionDispatch must be used within SessionProvider");
  return context;
}

export type { SessionConfig, Status };
