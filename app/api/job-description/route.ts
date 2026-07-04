import { NextResponse } from "next/server";
import { jobDescriptionRequestSchema } from "@/lib/validation";
import { fetchJobDescriptionHtml, looksLikeUrl } from "@/lib/jobDescription/fetchUrl";
import {
  extractJobDescriptionText,
  isMeaningfulJobDescription,
  truncateJobDescriptionText,
} from "@/lib/jobDescription/htmlToText";
import type { JobDescriptionResult } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FAILURE_MESSAGES: Record<
  Exclude<JobDescriptionResult, { status: "fetched" } | { status: "text" }>["reason"],
  string
> = {
  "invalid-url": "That doesn't look like a valid web address.",
  "blocked-host": "That address can't be fetched for security reasons.",
  "dns-failed": "That address couldn't be resolved. Double-check the URL.",
  timeout: "The page took too long to respond.",
  "http-error": "The page returned an error when we tried to fetch it.",
  "too-large": "The page was too large to process.",
  "non-html": "That URL didn't return a readable web page.",
  "empty-content": "We couldn't read enough text from that page — it may require JavaScript, like many LinkedIn postings.",
  "network-error": "We couldn't reach that address.",
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = jobDescriptionRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const raw = parsed.data.raw.trim();

  if (!looksLikeUrl(raw)) {
    const text = truncateJobDescriptionText(raw);
    const result: JobDescriptionResult = { status: "text", text };
    return NextResponse.json(result);
  }

  const fetchResult = await fetchJobDescriptionHtml(raw);
  if (!fetchResult.ok) {
    const result: JobDescriptionResult = {
      status: "fetch-failed",
      reason: fetchResult.reason,
      message: FAILURE_MESSAGES[fetchResult.reason],
    };
    return NextResponse.json(result);
  }

  const text = extractJobDescriptionText(fetchResult.html);
  if (!isMeaningfulJobDescription(text)) {
    const result: JobDescriptionResult = {
      status: "fetch-failed",
      reason: "empty-content",
      message: FAILURE_MESSAGES["empty-content"],
    };
    return NextResponse.json(result);
  }

  const result: JobDescriptionResult = {
    status: "fetched",
    text,
    sourceUrl: raw,
    truncated: text.length >= 12000,
  };
  return NextResponse.json(result);
}
