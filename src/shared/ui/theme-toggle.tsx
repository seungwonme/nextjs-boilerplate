"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { LuMonitor, LuMoon, LuSun } from "react-icons/lu";
import { getThemeState } from "./theme-state";

const BUTTON_CLASS_NAME =
  "inline-flex size-9 items-center justify-center rounded-md outline-none transition-colors hover:bg-foreground/10 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const themeState = getThemeState(theme);

  if (!mounted) {
    return (
      <button
        type="button"
        className={BUTTON_CLASS_NAME}
        aria-label={themeState.label}
        disabled
      >
        <LuMonitor className="size-5" aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(themeState.next)}
      className={BUTTON_CLASS_NAME}
      aria-label={themeState.label}
    >
      {themeState.current === "light" && (
        <LuSun className="size-5" aria-hidden="true" />
      )}
      {themeState.current === "dark" && (
        <LuMoon className="size-5" aria-hidden="true" />
      )}
      {themeState.current === "system" && (
        <LuMonitor className="size-5" aria-hidden="true" />
      )}
    </button>
  );
}
