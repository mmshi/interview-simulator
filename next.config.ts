import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CLAUDE.md is read via fs at request time but never imported, so Next.js
  // won't trace it into the deployed serverless bundle without this entry.
  outputFileTracingIncludes: {
    "/api/**/*": ["./CLAUDE.md"],
  },
};

export default nextConfig;
