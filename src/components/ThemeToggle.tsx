"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

function subscribeNoop() {
  return () => {};
}
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribeNoop,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (!mounted) {
    return <div className="h-9 w-9" aria-hidden />;
  }

  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Ganti tema gelap/terang"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition hover:bg-black/5 dark:hover:bg-white/10"
    >
      {isDark ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path d="M12 3a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1Zm0 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm9-6a1 1 0 1 1 0 2h-1a1 1 0 1 1 0-2h1ZM4 12a1 1 0 1 1 0 2H3a1 1 0 1 1 0-2h1Zm14.36-6.36a1 1 0 0 1 1.42 1.42l-.71.7a1 1 0 1 1-1.41-1.41l.7-.71ZM6.34 17.66a1 1 0 0 1 1.41 1.41l-.7.71a1 1 0 0 1-1.42-1.42l.71-.7Zm11.32 0 .7.71a1 1 0 1 1-1.41 1.41l-.71-.7a1 1 0 0 1 1.42-1.42ZM6.34 6.34a1 1 0 0 1-1.41-1.42l.7-.7a1 1 0 1 1 1.42 1.41l-.71.71ZM12 20a1 1 0 0 1 1 1v-1a1 1 0 1 1-2 0v1a1 1 0 0 1 1-1Z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path d="M21.64 13a9 9 0 1 1-10.63-10.6 1 1 0 0 1 1.11 1.4 7 7 0 0 0 9.13 9.12 1 1 0 0 1 1.4 1.11Z" />
        </svg>
      )}
    </button>
  );
}
