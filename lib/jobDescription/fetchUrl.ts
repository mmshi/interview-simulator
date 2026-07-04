import dns from "dns/promises";
import net from "net";

const FETCH_TIMEOUT_MS = 8000;
const MAX_BYTES = 2 * 1024 * 1024;

export type FetchResult =
  | { ok: true; html: string }
  | {
      ok: false;
      reason:
        | "invalid-url"
        | "blocked-host"
        | "dns-failed"
        | "timeout"
        | "http-error"
        | "too-large"
        | "non-html"
        | "network-error";
    };

function isPrivateOrReservedIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    if (a === 127) return true; // loopback
    if (a === 10) return true; // RFC1918
    if (a === 172 && b >= 16 && b <= 31) return true; // RFC1918
    if (a === 192 && b === 168) return true; // RFC1918
    if (a === 169 && b === 254) return true; // link-local incl. cloud metadata
    if (a === 0) return true;
    return false;
  }
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === "::1") return true; // loopback
    if (lower.startsWith("fe80:")) return true; // link-local
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique local
    return false;
  }
  return true; // couldn't parse — treat as unsafe
}

export function looksLikeUrl(raw: string): boolean {
  try {
    const url = new URL(raw.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function fetchJobDescriptionHtml(rawUrl: string): Promise<FetchResult> {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return { ok: false, reason: "invalid-url" };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, reason: "invalid-url" };
  }

  const hostname = url.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".local")) {
    return { ok: false, reason: "blocked-host" };
  }

  let addresses: string[];
  try {
    const results = await dns.lookup(hostname, { all: true });
    addresses = results.map((r) => r.address);
  } catch {
    return { ok: false, reason: "dns-failed" };
  }

  if (addresses.length === 0 || addresses.some(isPrivateOrReservedIp)) {
    return { ok: false, reason: "blocked-host" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    // Known tradeoff: redirects are followed without re-checking DNS per hop,
    // so a URL that resolves safely could still redirect to an internal address.
    // Acceptable for a single-user personal tool; revisit with manual redirect
    // handling if this is ever exposed to untrusted users.
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; InterviewSimulatorBot/1.0)",
      },
    });

    if (!response.ok) {
      return { ok: false, reason: "http-error" };
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return { ok: false, reason: "non-html" };
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_BYTES) {
      return { ok: false, reason: "too-large" };
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > MAX_BYTES) {
      return { ok: false, reason: "too-large" };
    }

    const html = Buffer.from(buffer).toString("utf-8");
    return { ok: true, html };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { ok: false, reason: "timeout" };
    }
    return { ok: false, reason: "network-error" };
  } finally {
    clearTimeout(timeout);
  }
}
