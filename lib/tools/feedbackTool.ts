import type Anthropic from "@anthropic-ai/sdk";

export const feedbackTool: Anthropic.Tool = {
  name: "emit_answer_feedback",
  description: "Emit structured feedback on a candidate's interview answer.",
  input_schema: {
    type: "object",
    properties: {
      summary: { type: "string" },
      strengths: {
        type: "array",
        items: { type: "string" },
      },
      improvements: {
        type: "array",
        items: { type: "string" },
      },
      score: { type: "integer", minimum: 1, maximum: 10 },
      star: {
        type: "object",
        description:
          "Only include when the question is STAR-relevant and the answer was free-text.",
        properties: {
          situation: {
            type: "object",
            properties: {
              present: { type: "boolean" },
              comment: { type: "string" },
            },
            required: ["present", "comment"],
          },
          task: {
            type: "object",
            properties: {
              present: { type: "boolean" },
              comment: { type: "string" },
            },
            required: ["present", "comment"],
          },
          action: {
            type: "object",
            properties: {
              present: { type: "boolean" },
              comment: { type: "string" },
            },
            required: ["present", "comment"],
          },
          result: {
            type: "object",
            properties: {
              present: { type: "boolean" },
              comment: { type: "string" },
            },
            required: ["present", "comment"],
          },
          overallCoverage: {
            type: "string",
            enum: ["none", "partial", "strong"],
          },
        },
        required: ["situation", "task", "action", "result", "overallCoverage"],
      },
      multipleChoiceVerdict: {
        type: "object",
        description: "Only include when the answer was multiple-choice.",
        properties: {
          explanation: { type: "string" },
        },
        required: ["explanation"],
      },
    },
    required: ["summary", "strengths", "improvements", "score"],
  },
};
