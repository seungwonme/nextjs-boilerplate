import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { unstable_doesMiddlewareMatch } from "next/dist/experimental/testing/server/middleware-testing-utils.js";

test("proxy protects only the protected route tree", async () => {
  const source = await readFile(
    new URL("../proxy.ts", import.meta.url),
    "utf8",
  );
  const matcher = source.match(/matcher: \["([^"]+)"\]/)?.[1];

  assert.equal(matcher, "/protected/:path*");

  const matches = (url) =>
    unstable_doesMiddlewareMatch({ config: { matcher }, url });

  for (const url of [
    "/",
    "/robots.txt",
    "/sitemap.xml",
    "/manifest.webmanifest",
  ])
    assert.equal(matches(url), false);

  assert.equal(matches("/protected"), true);
  assert.equal(matches("/protected/settings"), true);
});
