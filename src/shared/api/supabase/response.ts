export function getAuthSuccessUrl(requestUrl: string | URL) {
  return new URL("/", requestUrl);
}

export function getEmailOtpParams(requestUrl: string | URL) {
  const { searchParams } = new URL(requestUrl);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (!token_hash || (type !== "email" && type !== "magiclink")) {
    return null;
  }

  return { token_hash, type } as const;
}

export function copyCookies<T extends { name: string; value: string }>(
  cookies: readonly T[],
  setCookie: (cookie: T) => void,
) {
  for (const cookie of cookies) {
    setCookie(cookie);
  }
}
