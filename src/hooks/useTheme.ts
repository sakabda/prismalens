import { useTheme as useNextTheme } from "next-themes";
import type { ThemeValue } from "../types/ui.types";

/**
 * Thin wrapper around next-themes for type safety
 * and to match our ThemeValue type.
 */
export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();

  const setValue = (value: ThemeValue) => {
    setTheme(value);
  };

  const toggle = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return {
    theme: (theme ?? "system") as ThemeValue,
    resolvedTheme: (resolvedTheme ?? "light") as "light" | "dark",
    setTheme: setValue,
    toggle,
  };
}
