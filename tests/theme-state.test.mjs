import assert from "node:assert/strict";
import test from "node:test";
import { getThemeState } from "../src/shared/ui/theme-state.ts";

test("theme state cycles system, light, dark", () => {
  assert.deepEqual(getThemeState("system"), {
    current: "system",
    next: "light",
    label: "Current theme: system. Switch to light.",
  });
  assert.equal(getThemeState("light").next, "dark");
  assert.equal(getThemeState("dark").next, "system");
  assert.equal(getThemeState(undefined).current, "system");
});
