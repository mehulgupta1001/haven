import React, { createContext, useContext, useMemo } from 'react';
import { colors, type HavenColors } from './colors';

export type HavenTheme = {
  colors: HavenColors;
};

const defaultTheme: HavenTheme = { colors };

const ThemeContext = createContext<HavenTheme>(defaultTheme);

type ThemeProviderProps = {
  children: React.ReactNode;
  /** Hook for future white-label / dark mode without rewiring consumers */
  value?: Partial<HavenTheme>;
};

/**
 * Supplies institutional design tokens app-wide.
 * Wrap the root navigator so screens and components share one source of truth.
 */
export function ThemeProvider({ children, value }: ThemeProviderProps) {
  const merged = useMemo<HavenTheme>(
    () => ({
      colors: { ...colors, ...(value?.colors ?? {}) },
    }),
    [value?.colors],
  );

  return <ThemeContext.Provider value={merged}>{children}</ThemeContext.Provider>;
}

export function useTheme(): HavenTheme {
  return useContext(ThemeContext);
}
