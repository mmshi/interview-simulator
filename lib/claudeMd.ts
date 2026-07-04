import fs from "fs";
import path from "path";
import type { CandidateProfile } from "./types";

const MAX_SECTION_CHARS = 500;
const MAX_TOTAL_CHARS = 4000;

const SECTION_KEYS: Record<string, keyof CandidateProfile> = {
  industry: "industry",
  "experience level": "experienceLevel",
  "career goals": "careerGoals",
};

function parseProfile(raw: string): CandidateProfile {
  const profile: CandidateProfile = {
    industry: null,
    experienceLevel: null,
    careerGoals: null,
  };

  const sections = raw.split(/^##\s+/m).slice(1);
  for (const section of sections) {
    const newlineIndex = section.indexOf("\n");
    if (newlineIndex === -1) continue;
    const heading = section.slice(0, newlineIndex).trim().toLowerCase();
    const key = SECTION_KEYS[heading];
    if (!key) continue;

    const body = section
      .slice(newlineIndex + 1)
      .replace(/<!--[\s\S]*?-->/g, "")
      .trim();
    if (!body) continue;

    profile[key] =
      body.length > MAX_SECTION_CHARS ? body.slice(0, MAX_SECTION_CHARS) : body;
  }

  return profile;
}

export function readCandidateProfile(): CandidateProfile {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "CLAUDE.md"), "utf-8");
    return parseProfile(raw);
  } catch {
    return { industry: null, experienceLevel: null, careerGoals: null };
  }
}

export function buildPersonalizationBlock(profile: CandidateProfile): string | null {
  const lines = [
    profile.industry && `- Industry: ${profile.industry}`,
    profile.experienceLevel && `- Experience level: ${profile.experienceLevel}`,
    profile.careerGoals && `- Career goals: ${profile.careerGoals}`,
  ].filter((line): line is string => Boolean(line));

  if (lines.length === 0) return null;
  return lines.join("\n").slice(0, MAX_TOTAL_CHARS);
}
