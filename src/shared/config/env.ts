const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export function resolveSiteUrl(
  value: string | undefined,
  isProduction: boolean,
) {
  const candidate = value?.trim();

  if (!candidate) {
    if (isProduction) {
      throw new Error("NEXT_PUBLIC_SITE_URL is required in production.");
    }

    return "http://localhost:3000";
  }

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a valid HTTP(S) origin.");
  }

  const isOriginOnly =
    url.pathname === "/" &&
    url.search === "" &&
    url.hash === "" &&
    url.username === "" &&
    url.password === "";

  if (
    !["http:", "https:"].includes(url.protocol) ||
    !isOriginOnly ||
    (isProduction && LOCAL_HOSTS.has(url.hostname))
  ) {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a public HTTP(S) origin.");
  }

  return url.origin;
}

export function resolveSupabaseEnv(
  urlValue: string | undefined,
  publishableKeyValue: string | undefined,
) {
  const candidate = urlValue?.trim();

  if (!candidate) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required.");
  }

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid HTTP(S) origin.");
  }

  const isOriginOnly =
    url.pathname === "/" &&
    url.search === "" &&
    url.hash === "" &&
    url.username === "" &&
    url.password === "";

  if (!["http:", "https:"].includes(url.protocol) || !isOriginOnly) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid HTTP(S) origin.");
  }

  const publishableKey = publishableKeyValue?.trim();
  if (!publishableKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required.");
  }

  return { url: url.origin, publishableKey } as const;
}

export function getSupabaseEnv() {
  return resolveSupabaseEnv(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

export const publicEnv = {
  siteUrl: resolveSiteUrl(
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NODE_ENV === "production",
  ),
  googleSiteVerification:
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? undefined,
  naverSiteVerification:
    process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION ?? undefined,
} as const;

export type PublicEnv = typeof publicEnv;
