import assert from "node:assert/strict";
import test from "node:test";
import { resolveSiteUrl } from "../src/shared/config/env.ts";

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
