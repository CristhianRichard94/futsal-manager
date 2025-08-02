'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

// import { useTheme } from 'next-themes';

// function ThemeToggle() {
//   const { theme, setTheme } = useTheme();

//   return (
//     <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
//       Toggle theme
//     </button>
//   );
// }
