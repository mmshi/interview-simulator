import { convert } from "html-to-text";

const MAX_JD_CHARS = 12000;
const MIN_MEANINGFUL_CHARS = 200;

export function extractJobDescriptionText(html: string): string {
  const text = convert(html, {
    selectors: [
      { selector: "script", format: "skip" },
      { selector: "style", format: "skip" },
      { selector: "nav", format: "skip" },
      { selector: "footer", format: "skip" },
      { selector: "img", format: "skip" },
      { selector: "a", options: { ignoreHref: true } },
    ],
    wordwrap: false,
  });

  const collapsed = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");

  return collapsed.slice(0, MAX_JD_CHARS);
}

export function isMeaningfulJobDescription(text: string): boolean {
  return text.trim().length >= MIN_MEANINGFUL_CHARS;
}

export function truncateJobDescriptionText(text: string): string {
  return text.slice(0, MAX_JD_CHARS);
}
