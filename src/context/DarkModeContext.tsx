import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface DarkModeContextType {
  isDark: boolean;
  toggle: () => void;
}

const DarkModeContext = createContext<DarkModeContextType>({ isDark: false, toggle: () => {} });

function getInitialDark(): boolean {
  // 1. Try localStorage
  try {
    const stored = localStorage.getItem('campuscare-dark-mode');
    if (stored !== null) return stored === 'true';
  } catch {
    // localStorage blocked (e.g. private browsing with strict settings)
  }
  // 2. Fall back to OS preference
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    // matchMedia not available
  }
  return false;
}

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(getInitialDark);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('campuscare-dark-mode', String(isDark));
    } catch {
      // Silently ignore if localStorage is unavailable
    }
  }, [isDark]);

  return (
    <DarkModeContext.Provider value={{ isDark, toggle: () => setIsDark(p => !p) }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  return useContext(DarkModeContext);
}
