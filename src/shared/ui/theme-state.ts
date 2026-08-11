const NEXT_THEME = {
  system: "light",
  light: "dark",
  dark: "system",
} as const;

export function getThemeState(theme: string | undefined) {
  const current = theme === "light" || theme === "dark" ? theme : "system";
  const next = NEXT_THEME[current];

  return {
    current,
    next,
    label: `Current theme: ${current}. Switch to ${next}.`,
  };
}
