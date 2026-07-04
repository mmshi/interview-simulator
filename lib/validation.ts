import { z } from "zod";

export const questionCategorySchema = z.enum(["behavioral", "case", "situational"]);
export const difficultySchema = z.enum(["easy", "medium", "hard"]);
export const practiceModeSchema = z.enum(["generic", "job-description"]);

export const generateQuestionsRequestSchema = z.object({
  mode: practiceModeSchema,
  category: questionCategorySchema,
  difficulty: difficultySchema,
  count: z.number().int().min(1).max(10),
  jobDescriptionText: z.string().max(12000).optional(),
});

export const jobDescriptionRequestSchema = z.object({
  raw: z.string().min(1).max(20000),
});

const multipleChoiceOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
});

export const feedbackRequestSchema = z
  .object({
    question: z.object({
      id: z.string(),
      category: questionCategorySchema,
      difficulty: difficultySchema,
      prompt: z.string(),
      isStarRelevant: z.boolean(),
    }),
    answerMode: z.enum(["free-text", "multiple-choice"]),
    freeTextAnswer: z.string().max(8000).optional(),
    selectedOptionId: z.string().optional(),
    multipleChoiceContext: z
      .object({
        options: z.array(multipleChoiceOptionSchema).min(2),
        idealOptionId: z.string(),
        rationale: z.string(),
      })
      .optional(),
    jobDescriptionText: z.string().max(12000).optional(),
  })
  .refine(
    (data) =>
      data.answerMode === "free-text"
        ? Boolean(data.freeTextAnswer && data.freeTextAnswer.trim().length > 0)
        : Boolean(data.selectedOptionId && data.multipleChoiceContext),
    { message: "Missing required fields for the given answerMode" },
  );
