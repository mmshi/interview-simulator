"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ProgressHeader } from "@/components/ProgressHeader";
import { QuestionCard } from "@/components/QuestionCard";
import { AnswerModeToggle } from "@/components/AnswerModeToggle";
import { FreeTextAnswer } from "@/components/FreeTextAnswer";
import { MultipleChoiceAnswer } from "@/components/MultipleChoiceAnswer";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { useSessionDispatch, useSessionState } from "@/store/SessionContext";
import type { AnswerMode, Feedback } from "@/lib/types";

export default function PracticePage() {
  const router = useRouter();
  const state = useSessionState();
  const dispatch = useSessionDispatch();

  const [answerMode, setAnswerMode] = useState<AnswerMode>("free-text");
  const [freeText, setFreeText] = useState("");
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!state.config) {
      router.replace("/");
    }
  }, [state.config, router]);

  useEffect(() => {
    setFreeText("");
    setSelectedOptionId(null);
    setAnswerMode("free-text");
    setSubmitError(null);
  }, [state.currentIndex]);

  if (!state.config) return null;

  const question = state.questions[state.currentIndex];
  const isLastQuestion = state.currentIndex >= state.questions.length - 1;
  const currentFeedback: Feedback | undefined = question
    ? state.feedbackByQuestionId[question.id]
    : undefined;

  if (!question) {
    return (
      <main className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Session complete</h1>
        <p className="text-slate-500">You&apos;ve answered all the questions in this practice set.</p>
        <Button onClick={() => dispatch({ type: "RESET" })}>Start a new session</Button>
      </main>
    );
  }

  async function submitAnswer() {
    setSubmitError(null);
    const answer =
      answerMode === "free-text"
        ? ({ questionId: question.id, mode: "free-text" as const, freeText } as const)
        : ({ questionId: question.id, mode: "multiple-choice" as const, selectedOptionId: selectedOptionId! } as const);

    dispatch({ type: "SUBMIT_ANSWER_START", answer });

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: {
            id: question.id,
            category: question.category,
            difficulty: question.difficulty,
            prompt: question.prompt,
            isStarRelevant: question.isStarRelevant,
          },
          answerMode,
          freeTextAnswer: answerMode === "free-text" ? freeText : undefined,
          selectedOptionId: answerMode === "multiple-choice" ? selectedOptionId : undefined,
          multipleChoiceContext:
            answerMode === "multiple-choice"
              ? {
                  options: question.multipleChoice.options,
                  idealOptionId: question.multipleChoice.idealOptionId,
                  rationale: question.multipleChoice.rationale,
                }
              : undefined,
          jobDescriptionText: state.config?.jobDescriptionText ?? undefined,
        }),
      });

      if (!response.ok) throw new Error("Feedback request failed");
      const data: { feedback: Feedback } = await response.json();
      dispatch({ type: "FEEDBACK_RECEIVED", questionId: question.id, feedback: data.feedback });
    } catch {
      setSubmitError("Couldn't analyze your answer right now. Please try again.");
      dispatch({ type: "ERROR", message: "Feedback request failed" });
    }
  }

  const canSubmit =
    answerMode === "free-text" ? freeText.trim().length > 0 : Boolean(selectedOptionId);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <ProgressHeader
        currentIndex={state.currentIndex}
        total={state.questions.length}
        category={question.category}
        difficulty={question.difficulty}
      />

      <QuestionCard question={question} />

      {state.status === "showing-feedback" && currentFeedback ? (
        <>
          <FeedbackPanel feedback={currentFeedback} />
          <Button onClick={() => dispatch({ type: "NEXT_QUESTION" })} className="self-end">
            {isLastQuestion ? "Finish" : "Next question"}
          </Button>
        </>
      ) : (
        <div className="space-y-4">
          <AnswerModeToggle mode={answerMode} onChange={setAnswerMode} />

          {answerMode === "free-text" ? (
            <FreeTextAnswer value={freeText} onChange={setFreeText} />
          ) : (
            <MultipleChoiceAnswer
              options={question.multipleChoice.options}
              selectedOptionId={selectedOptionId}
              onSelect={setSelectedOptionId}
            />
          )}

          {submitError && <p className="text-sm text-rose-600">{submitError}</p>}

          <Button
            disabled={!canSubmit || state.status === "submitting-answer"}
            onClick={submitAnswer}
            className="w-full sm:w-auto"
          >
            {state.status === "submitting-answer" && <Spinner />}
            Submit answer
          </Button>
        </div>
      )}
    </main>
  );
}
