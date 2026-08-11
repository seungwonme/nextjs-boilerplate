import assert from "node:assert/strict";
import test from "node:test";
import {
  copyCookies,
  getAuthSuccessUrl,
} from "../src/shared/api/supabase/response.ts";

test("auth success redirects ignore untrusted destinations", () => {
  for (const next of [
    "/%5Cevil.example",
    "%2F%5Cevil.example",
    "//evil.example",
    "https://evil.example/",
    "javascript:alert(1)",
  ]) {
    const requestUrl = new URL("https://app.example/auth/confirm");
    requestUrl.searchParams.set("next", next);
    assert.equal(getAuthSuccessUrl(requestUrl).href, "https://app.example/");
  }
});

test("redirect cookie copying preserves values and options", () => {
  const cookies = [
    {
      name: "sb-session",
      value: "refreshed",
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    },
  ];
  const copied = [];

  copyCookies(cookies, (cookie) => copied.push(cookie));

  assert.deepEqual(copied, cookies);
});
