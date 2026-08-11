export function getAuthSuccessUrl(requestUrl: string | URL) {
  return new URL("/", requestUrl);
}

export function copyCookies<T extends { name: string; value: string }>(
  cookies: readonly T[],
  setCookie: (cookie: T) => void,
) {
  for (const cookie of cookies) {
    setCookie(cookie);
  }
}
