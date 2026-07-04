import type Anthropic from "@anthropic-ai/sdk";

export const questionTool: Anthropic.Tool = {
  name: "emit_interview_questions",
  description: "Emit a set of generated interview questions.",
  input_schema: {
    type: "object",
    properties: {
      questions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            category: {
              type: "string",
              enum: ["behavioral", "case", "situational"],
            },
            difficulty: {
              type: "string",
              enum: ["easy", "medium", "hard"],
            },
            prompt: { type: "string" },
            isStarRelevant: { type: "boolean" },
            tags: {
              type: "array",
              items: { type: "string" },
            },
            multipleChoice: {
              type: "object",
              properties: {
                options: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      text: { type: "string" },
                    },
                    required: ["id", "text"],
                  },
                  minItems: 3,
                  maxItems: 5,
                },
                idealOptionId: { type: "string" },
                rationale: { type: "string" },
              },
              required: ["options", "idealOptionId", "rationale"],
            },
          },
          required: [
            "category",
            "difficulty",
            "prompt",
            "isStarRelevant",
            "tags",
            "multipleChoice",
          ],
        },
      },
    },
    required: ["questions"],
  },
};
