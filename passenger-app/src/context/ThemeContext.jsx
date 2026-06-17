import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import { saveDarkMode, getDarkMode } from '../storage/storage';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadTheme();
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDark(colorScheme === 'dark');
    });
    return () => sub.remove();
  }, []);

  async function loadTheme() {
    const saved = await getDarkMode();
    setIsDark(saved ?? Appearance.getColorScheme() === 'dark');
  }

  async function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    await saveDarkMode(next);
  }

  const theme = {
    isDark,
    toggleTheme,
    bg: isDark ? '#0F172A' : '#F9FAFB',
    card: isDark ? '#1E293B' : '#FFFFFF',
    text: isDark ? '#F1F5F9' : '#111827',
    textSec: isDark ? '#94A3B8' : '#6B7280',
    border: isDark ? '#334155' : '#E5E7EB',
    header: isDark ? '#0F172A' : '#1E40AF',
    input: isDark ? '#1E293B' : '#FFFFFF',
    placeholder: isDark ? '#64748B' : '#9CA3AF'
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}