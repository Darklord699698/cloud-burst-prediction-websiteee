// src/components/ThemeContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

export const ThemeContext = createContext({
  darkMode: false,
  setDarkMode: () => {},
});

const getInitialTheme = () => {
  try {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("darkMode");
    if (stored !== null) return stored === "true";
    // fallback to system preference
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch (e) {
    return false;
  }
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", darkMode);
    try {
      localStorage.setItem("darkMode", darkMode);
    } catch (e) {
      // ignore if storage is disabled
    }
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// handy hook
export const useTheme = () => useContext(ThemeContext);
