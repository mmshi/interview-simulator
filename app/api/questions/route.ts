import { NextResponse } from "next/server";
import { anthropic, MODEL_ID } from "@/lib/anthropic";
import { QUESTION_INSTRUCTIONS } from "@/lib/prompts/questionInstructions";
import { questionTool } from "@/lib/tools/questionTool";
import { buildSystemBlocks } from "@/lib/systemPrompt";
import { generateQuestionsRequestSchema } from "@/lib/validation";
import type { Question } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = generateQuestionsRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const { mode, category, difficulty, count, jobDescriptionText } = parsed.data;
  if (mode === "job-description" && !jobDescriptionText) {
    return NextResponse.json(
      { error: "jobDescriptionText is required when mode is 'job-description'" },
      { status: 400 },
    );
  }

  const system = buildSystemBlocks({
    staticInstructions: QUESTION_INSTRUCTIONS,
    jobDescriptionText: mode === "job-description" ? jobDescriptionText : null,
  });

  const userMessage = `Generate exactly ${count} interview question(s).
Category: ${category}
Difficulty: ${difficulty}
${mode === "job-description" ? "Tailor these questions specifically to the target job description provided above." : "These are general practice questions, not tied to any specific job posting."}`;

  try {
    const response = await anthropic.messages.create({
      model: MODEL_ID,
      max_tokens: 4096,
      system,
      tools: [questionTool],
      tool_choice: { type: "tool", name: "emit_interview_questions" },
      messages: [{ role: "user", content: userMessage }],
    });

    const toolUse = response.content.find((block) => block.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return NextResponse.json({ error: "Model did not return structured questions" }, { status: 502 });
    }

    const raw = toolUse.input as {
      questions: Array<{
        category: Question["category"];
        difficulty: Question["difficulty"];
        prompt: string;
        isStarRelevant: boolean;
        tags: string[];
        multipleChoice: {
          options: Array<{ id: string; text: string }>;
          idealOptionId: string;
          rationale: string;
        };
      }>;
    };

    const questions: Question[] = raw.questions.map((q) => ({
      id: crypto.randomUUID(),
      category: q.category,
      difficulty: q.difficulty,
      prompt: q.prompt,
      isStarRelevant: q.isStarRelevant,
      tags: q.tags ?? [],
      multipleChoice: q.multipleChoice,
    }));

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Question generation failed", error);
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 502 });
  }
}
