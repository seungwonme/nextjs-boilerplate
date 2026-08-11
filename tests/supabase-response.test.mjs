import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server.js";
import { handleAuthConfirmation } from "../src/shared/api/supabase/confirm.ts";
import { updateSession } from "../src/shared/api/supabase/middleware.ts";
import {
  copyCookies,
  getAuthSuccessUrl,
  getEmailOtpParams,
} from "../src/shared/api/supabase/response.ts";

const testEnv = () => ({
  url: "https://project.supabase.co",
  publishableKey: "publishable-key",
});

function assertSessionCookie(response) {
  assert.deepEqual(response.cookies.get("sb-session"), {
    name: "sb-session",
    value: "refreshed",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: true,
  });

  const setCookie = response.headers.get("set-cookie");
  assert.match(setCookie, /Path=\//);
  assert.match(setCookie, /Secure/);
  assert.match(setCookie, /HttpOnly/);
  assert.match(setCookie, /SameSite=lax/);
}

function refreshSession(options) {
  options.cookies.setAll([
    {
      name: "sb-session",
      value: "refreshed",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
  ]);
}

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

test("email confirmation accepts only the documented OTP contract", () => {
  assert.deepEqual(
    getEmailOtpParams(
      "https://app.example/auth/confirm?token_hash=secret&type=email",
    ),
    { token_hash: "secret", type: "email" },
  );
  assert.deepEqual(
    getEmailOtpParams(
      "https://app.example/auth/confirm?token_hash=secret&type=magiclink",
    ),
    { token_hash: "secret", type: "magiclink" },
  );

  for (const query of [
    "token_hash=secret&type=recovery",
    "token_hash=secret&type=signup",
    "type=email",
  ]) {
    assert.equal(
      getEmailOtpParams(`https://app.example/auth/confirm?${query}`),
      null,
    );
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

test("confirmation returns the real success redirect with session cookies", async () => {
  for (const [query, expectedMethod, expectedValue] of [
    ["code=authorization-code", "exchange", "authorization-code"],
    ["token_hash=otp-token&type=email", "verify", "otp-token"],
  ]) {
    let calledMethod;
    const request = new NextRequest(
      `https://app.example/auth/confirm?${query}`,
    );
    const createClient = (url, key, options) => {
      assert.equal(url, testEnv().url);
      assert.equal(key, testEnv().publishableKey);

      return {
        auth: {
          async exchangeCodeForSession(code) {
            calledMethod = "exchange";
            assert.equal(code, expectedValue);
            refreshSession(options);
            return { error: null };
          },
          async verifyOtp(params) {
            calledMethod = "verify";
            assert.deepEqual(params, {
              token_hash: expectedValue,
              type: "email",
            });
            refreshSession(options);
            return { error: null };
          },
        },
      };
    };

    const response = await handleAuthConfirmation(
      request,
      createClient,
      testEnv,
    );

    assert.equal(calledMethod, expectedMethod);
    assert.equal(response.status, 307);
    assert.equal(response.headers.get("location"), "https://app.example/");
    assertSessionCookie(response);
  }
});

test("protected redirects preserve refreshed session cookies", async () => {
  const request = new NextRequest("https://app.example/protected/settings");
  const createClient = (url, key, options) => {
    assert.equal(url, testEnv().url);
    assert.equal(key, testEnv().publishableKey);

    return {
      auth: {
        async getUser() {
          refreshSession(options);
          return { data: { user: null }, error: null };
        },
      },
    };
  };

  const response = await updateSession(request, createClient, testEnv);

  assert.equal(response.status, 307);
  assert.equal(
    response.headers.get("location"),
    "https://app.example/auth/login",
  );
  assertSessionCookie(response);
});
