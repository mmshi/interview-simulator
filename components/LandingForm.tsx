"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { JobDescriptionInput } from "@/components/JobDescriptionInput";
import { useSessionDispatch } from "@/store/SessionContext";
import type { Difficulty, PracticeMode, Question, QuestionCategory } from "@/lib/types";

const CATEGORIES: { value: QuestionCategory; label: string; description: string }[] = [
  { value: "behavioral", label: "Behavioral", description: "STAR-method “tell me about a time…” questions" },
  { value: "case", label: "Case", description: "Open-ended problem-solving scenarios" },
  { value: "situational", label: "Situational Judgment", description: "“What would you do if…” hypotheticals" },
];

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];
const QUESTION_COUNT = 5;

export function LandingForm() {
  const router = useRouter();
  const dispatch = useSessionDispatch();

  const [category, setCategory] = useState<QuestionCategory>("behavioral");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [mode, setMode] = useState<PracticeMode>("generic");
  const [jobDescriptionText, setJobDescriptionText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canStart = mode === "generic" || Boolean(jobDescriptionText);

  async function startSession() {
    setLoading(true);
    setError(null);
    dispatch({
      type: "START_SESSION",
      config: { mode, category, difficulty, jobDescriptionText },
    });

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          category,
          difficulty,
          count: QUESTION_COUNT,
          jobDescriptionText: jobDescriptionText ?? undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate questions");
      const data: { questions: Question[] } = await response.json();

      dispatch({ type: "QUESTIONS_LOADED", questions: data.questions });
      router.push("/practice");
    } catch {
      setError("Couldn't generate questions right now. Please try again.");
      dispatch({ type: "RESET" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Interview Simulator
        </h1>
        <p className="mt-2 text-slate-500">
          Practice behavioral, case, and situational-judgment questions with instant AI feedback.
        </p>
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Question type
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                category === c.value
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <CategoryIcon category={c.value} className="mb-2" />
              <div className="text-sm font-medium text-slate-900">{c.label}</div>
              <div className="mt-1 text-xs text-slate-500">{c.description}</div>
            </button>
          ))}
        </div>

        <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Difficulty
        </h2>
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                difficulty === d
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Job description mode
        </h2>
        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setMode("generic");
              setJobDescriptionText(null);
            }}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              mode === "generic"
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            General practice
          </button>
          <button
            type="button"
            onClick={() => setMode("job-description")}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              mode === "job-description"
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            Tailor to a job posting
          </button>
        </div>

        {mode === "job-description" && (
          <JobDescriptionInput
            resolvedText={jobDescriptionText}
            onResolved={setJobDescriptionText}
            onClear={() => setJobDescriptionText(null)}
          />
        )}
      </Card>

      {error && <p className="text-center text-sm text-rose-600">{error}</p>}

      <Button
        type="button"
        disabled={!canStart || loading}
        onClick={startSession}
        className="mx-auto w-full sm:w-auto sm:px-8"
      >
        {loading && <Spinner />}
        Start Practice
      </Button>
    </div>
  );
}
