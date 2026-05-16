"use client"

import { createContext, useContext, useEffect, useState } from "react"

import { themeColors, ThemeType } from "@/constants"


type ThemeContextType = {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as ThemeType | null;
    if (saved === "light" || saved === "dark") {
      setThemeState(saved);
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setThemeState(mediaQuery.matches ? "dark" : "light");
  }, []);

  const setTheme = (nextTheme: ThemeType) => {
    setThemeState(nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}