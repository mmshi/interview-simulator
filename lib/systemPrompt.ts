import type Anthropic from "@anthropic-ai/sdk";
import { buildPersonalizationBlock, readCandidateProfile } from "./claudeMd";

export function buildSystemBlocks(opts: {
  staticInstructions: string;
  jobDescriptionText?: string | null;
}): Anthropic.TextBlockParam[] {
  const blocks: Anthropic.TextBlockParam[] = [
    {
      type: "text",
      text: opts.staticInstructions,
      cache_control: { type: "ephemeral" },
    },
  ];

  const personalizationBlock = buildPersonalizationBlock(readCandidateProfile());
  if (personalizationBlock) {
    blocks.push({
      type: "text",
      text: `Candidate background (use to calibrate tone, difficulty, and relevance; never quote it verbatim back to the user):\n${personalizationBlock}`,
      cache_control: { type: "ephemeral" },
    });
  }

  if (opts.jobDescriptionText) {
    blocks.push({
      type: "text",
      text: `Target job description the candidate is preparing for:\n${opts.jobDescriptionText}`,
      cache_control: { type: "ephemeral" },
    });
  }

  return blocks;
}
