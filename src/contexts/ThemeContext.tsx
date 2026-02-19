import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyTheme(next: Theme) {
  const root = document.documentElement;
  const metaTheme = document.querySelector('meta[name="theme-color"]');

  if (next === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');

    if (metaTheme) metaTheme.setAttribute('content', '#111827');
  }
  else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');

    if (metaTheme) metaTheme.setAttribute('content', '#ef4444');
  }
  try {
    localStorage.setItem('theme', next);
  }
  catch (_) { }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';

    const saved = localStorage.getItem('theme');

    if (saved === 'dark' || saved === 'light') return saved;

    return 'light';
  });

  const themeRef = useRef(theme);

  themeRef.current = theme;

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const next: Theme = themeRef.current === 'light' ? 'dark' : 'light';

    applyTheme(next);
    setTheme(next);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) throw new Error('useTheme must be used within ThemeProvider');

  return context;
}