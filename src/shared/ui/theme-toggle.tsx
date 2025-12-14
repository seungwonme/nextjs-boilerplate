"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { LuMonitor, LuMoon, LuSun } from "react-icons/lu";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-md p-2 hover:bg-foreground/10"
        aria-label="Toggle theme"
      >
        <span className="size-5" />
      </button>
    );
  }

  const cycleTheme = () => {
    if (theme === "system") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("system");
    }
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className="inline-flex items-center justify-center rounded-md p-2 hover:bg-foreground/10 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "light" && <LuSun className="size-5" />}
      {theme === "dark" && <LuMoon className="size-5" />}
      {theme === "system" && <LuMonitor className="size-5" />}
    </button>
  );
}
