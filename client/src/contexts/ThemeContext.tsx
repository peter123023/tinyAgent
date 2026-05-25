import React, { createContext, useContext } from 'react';
import { ThemeColors, defaultTheme } from '../themes';

const ThemeContext = createContext<{
  theme: ThemeColors;
  themeName: string;
  toggleTheme: () => void;
}>({
  theme: defaultTheme,
  themeName: 'default',
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);
export const ThemeProvider = ThemeContext.Provider;
