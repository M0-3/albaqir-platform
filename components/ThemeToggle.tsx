"use client";
import { Moon, Sun } from "lucide-react";
export default function ThemeToggle() {
  const toggle = () => {
    const d = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", d ? "dark" : "light");
  };
  return (
    <button onClick={toggle} aria-label="تبديل الوضع" className="glass rounded-full p-2">
      <Sun className="hidden h-5 w-5 dark:block" /><Moon className="h-5 w-5 dark:hidden" />
    </button>
  );
}
