"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("kv3_theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = saved ? saved === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", shouldBeDark);
    setDark(shouldBeDark);
    setMounted(true);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("kv3_theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle Light or Dark theme"
      title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="inline-flex items-center gap-1.5 rounded-full border border-navy/20 bg-white/85 px-3 py-1.5 text-xs font-semibold text-navy transition hover:border-saffron hover:text-saffron dark:border-white/20 dark:bg-navy-deep/90 dark:text-ivory dark:hover:border-brass-light dark:hover:text-brass-light"
    >
      {mounted && dark ? (
        <>
          <Sun className="h-3.5 w-3.5 text-brass-light" />
          <span className="hidden sm:inline">Light</span>
        </>
      ) : (
        <>
          <Moon className="h-3.5 w-3.5 text-saffron" />
          <span className="hidden sm:inline">Dark</span>
        </>
      )}
    </button>
  );
}
