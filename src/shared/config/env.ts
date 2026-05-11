// Typed access to public environment variables.
// Server-only variables should be accessed directly via `process.env` in
// server-only files (e.g. server actions, route handlers).

export const publicEnv = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  googleSiteVerification:
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? undefined,
  naverSiteVerification:
    process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION ?? undefined,
} as const;

export type PublicEnv = typeof publicEnv;
