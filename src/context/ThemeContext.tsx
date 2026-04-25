import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Theme } from '@/types';

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  label: string;
}

const ThemeContext = createContext<ThemeState>({
  theme: 'dark',
  toggle: () => {},
  label: 'Claridad Cálida (oscuro)',
});

function getSavedTheme(): Theme {
  return (localStorage.getItem('sasim-theme') as Theme) ?? 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getSavedTheme);

  useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('sasim-theme', theme);
}, [theme]);

  function toggle() {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }

  const label = theme === 'dark' ? 'Claridad Cálida (oscuro)' : 'Naturaleza Educativa (claro)';

  return (
    <ThemeContext.Provider value={{ theme, toggle, label }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
