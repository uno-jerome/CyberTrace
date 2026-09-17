import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const STORAGE_KEY = 'cybertrace_theme';

const ThemeContext = createContext({
  theme: 'dark',
  isDark: true,
  toggleTheme: () => {},
});

const getSystemPrefersDark = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return true;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
  } catch (err) {
    console.warn('Unable to access localStorage for theme preference:', err);
  }
  return getSystemPrefersDark() ? 'dark' : 'light';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  const isDark = theme === 'dark';

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [isDark]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (e) => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const nextTheme = prevTheme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEY, nextTheme);
      } catch (err) {
        console.warn('Unable to persist theme preference:', err);
      }
      return nextTheme;
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark,
      toggleTheme,
    }),
    [theme, isDark, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
