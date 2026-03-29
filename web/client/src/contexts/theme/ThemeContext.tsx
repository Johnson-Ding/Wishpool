import { createContext, useEffect, useState, ReactNode, useContext } from 'react';

export type Theme = 'moon' | 'star' | 'cloud';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'moon',
  setTheme: () => {},
});

// useTheme hook
export function useTheme() {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('moon');

  useEffect(() => {
    // 从localStorage读取保存的主题
    const savedTheme = localStorage.getItem('wishpool-theme') as Theme;
    if (savedTheme && ['moon', 'star', 'cloud'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // 应用主题到document
    document.documentElement.setAttribute('data-theme', theme);
    // 保存到localStorage
    localStorage.setItem('wishpool-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}