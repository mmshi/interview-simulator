import { NextResponse } from "next/server";
import { anthropic, MODEL_ID } from "@/lib/anthropic";
import { FEEDBACK_INSTRUCTIONS } from "@/lib/prompts/feedbackInstructions";
import { feedbackTool } from "@/lib/tools/feedbackTool";
import { buildSystemBlocks } from "@/lib/systemPrompt";
import { feedbackRequestSchema } from "@/lib/validation";
import type { Feedback, StarBreakdown } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = feedbackRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const { question, answerMode, freeTextAnswer, selectedOptionId, multipleChoiceContext, jobDescriptionText } =
    parsed.data;

  const system = buildSystemBlocks({
    staticInstructions: FEEDBACK_INSTRUCTIONS,
    jobDescriptionText: jobDescriptionText ?? null,
  });

  let userMessage = `Question (${question.category}, ${question.difficulty}${question.isStarRelevant ? ", STAR-relevant" : ""}):\n${question.prompt}\n\n`;

  let deterministicCorrect = false;
  let selectedOptionText = "";
  let idealOptionText = "";

  if (answerMode === "free-text") {
    userMessage += `The candidate answered in free text:\n"""\n${freeTextAnswer}\n"""`;
  } else {
    const options = multipleChoiceContext!.options;
    const selected = options.find((o) => o.id === selectedOptionId);
    const ideal = options.find((o) => o.id === multipleChoiceContext!.idealOptionId);
    selectedOptionText = selected?.text ?? "(unknown option)";
    idealOptionText = ideal?.text ?? "(unknown option)";
    deterministicCorrect = selectedOptionId === multipleChoiceContext!.idealOptionId;

    userMessage += `The candidate answered via multiple choice.
Options presented:
${options.map((o) => `- (${o.id}) ${o.text}`).join("\n")}

Candidate selected: (${selectedOptionId}) ${selectedOptionText}
Ideal option: (${multipleChoiceContext!.idealOptionId}) ${idealOptionText}
Rationale for ideal option: ${multipleChoiceContext!.rationale}
This selection was ${deterministicCorrect ? "CORRECT" : "INCORRECT"} — treat this as ground truth and write coaching feedback explaining why, using the rationale provided.`;
  }

  try {
    const response = await anthropic.messages.create({
      model: MODEL_ID,
      max_tokens: 2048,
      system,
      tools: [feedbackTool],
      tool_choice: { type: "tool", name: "emit_answer_feedback" },
      messages: [{ role: "user", content: userMessage }],
    });

    const toolUse = response.content.find((block) => block.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return NextResponse.json({ error: "Model did not return structured feedback" }, { status: 502 });
    }

    const raw = toolUse.input as {
      summary: string;
      strengths: string[];
      improvements: string[];
      score: number;
      star?: StarBreakdown;
      multipleChoiceVerdict?: { explanation: string };
    };

    const feedback: Feedback = {
      summary: raw.summary,
      strengths: raw.strengths ?? [],
      improvements: raw.improvements ?? [],
      score: raw.score,
      star:
        answerMode === "free-text" && question.isStarRelevant && raw.star
          ? raw.star
          : null,
      multipleChoiceVerdict:
        answerMode === "multiple-choice"
          ? {
              correct: deterministicCorrect,
              selectedOptionText,
              idealOptionText,
              explanation: raw.multipleChoiceVerdict?.explanation ?? "",
            }
          : null,
    };

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Feedback generation failed", error);
    return NextResponse.json({ error: "Failed to generate feedback" }, { status: 502 });
  }
}
