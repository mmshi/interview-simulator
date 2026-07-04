"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import type { JobDescriptionResult } from "@/lib/types";

interface JobDescriptionInputProps {
  onResolved: (text: string) => void;
  resolvedText: string | null;
  onClear: () => void;
}

export function JobDescriptionInput({ onResolved, resolvedText, onClear }: JobDescriptionInputProps) {
  const [raw, setRaw] = useState("");
  const [pasteFallback, setPasteFallback] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function analyze(value: string) {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/job-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw: value }),
      });
      const result: JobDescriptionResult = await response.json();

      if (result.status === "fetched" || result.status === "text") {
        onResolved(result.text);
        setPasteFallback(false);
      } else {
        setErrorMessage(result.message);
        setPasteFallback(true);
      }
    } catch {
      setErrorMessage("Something went wrong reaching that address.");
      setPasteFallback(true);
    } finally {
      setLoading(false);
    }
  }

  if (resolvedText) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        <div className="flex items-center justify-between gap-4">
          <span>Job description loaded ({resolvedText.length.toLocaleString()} characters).</span>
          <button
            type="button"
            onClick={() => {
              onClear();
              setRaw("");
            }}
            className="text-xs font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
          >
            Clear
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder="Paste a job posting URL, or paste the job description text directly..."
        rows={4}
        className="w-full resize-none rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
      />
      {errorMessage && <p className="text-sm text-rose-600">{errorMessage}</p>}
      {pasteFallback && (
        <p className="text-xs text-slate-500">
          Try pasting the job description text directly above instead of the link.
        </p>
      )}
      <Button
        type="button"
        variant="secondary"
        disabled={loading || raw.trim().length === 0}
        onClick={() => analyze(raw)}
      >
        {loading && <Spinner />}
        Analyze job description
      </Button>
    </div>
  );
}
