import { useState, useEffect } from "react";

/**
 * useDarkMode hook
 * Persists dark mode preference to localStorage and syncs with
 * the `dark` class on <html> element (required for Tailwind dark mode).
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("qr_dark_mode");
    return saved ? JSON.parse(saved) : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("qr_dark_mode", JSON.stringify(isDark));
  }, [isDark]);

  const toggle = () => setIsDark((prev) => !prev);

  return { isDark, toggle };
}
