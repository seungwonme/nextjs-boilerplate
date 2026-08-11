import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveSiteUrl,
  resolveSupabaseEnv,
} from "../src/shared/config/env.ts";

test("site URL validation keeps production metadata public", () => {
  assert.equal(resolveSiteUrl(undefined, false), "http://localhost:3000");
  assert.equal(
    resolveSiteUrl(" https://example.com/ ", true),
    "https://example.com",
  );

  for (const value of [
    undefined,
    "http://localhost:3000",
    "javascript:alert(1)",
    "https://example.com/path",
    "https://user:secret@example.com",
  ]) {
    assert.throws(() => resolveSiteUrl(value, true));
  }
});

test("Supabase public credentials have one validated boundary", () => {
  assert.deepEqual(
    resolveSupabaseEnv(" https://project.supabase.co/ ", " publishable-key "),
    {
      url: "https://project.supabase.co",
      publishableKey: "publishable-key",
    },
  );

  for (const [url, key] of [
    [undefined, "publishable-key"],
    ["javascript:alert(1)", "publishable-key"],
    ["https://project.supabase.co/path", "publishable-key"],
    ["https://project.supabase.co", undefined],
    ["https://project.supabase.co", "   "],
  ]) {
    assert.throws(() => resolveSupabaseEnv(url, key));
  }
});
