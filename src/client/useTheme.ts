/**
 * useTheme.ts - Theme management hook
 *
 * Provides dark/light theme toggling with:
 * - localStorage persistence (survives page reloads)
 * - System preference detection (prefers-color-scheme) as default
 * - Applies theme via data-theme attribute on <html> for CSS variable switching
 */

import { useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('elevator-viewer-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    // Fall back to OS-level preference
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  // Sync theme to DOM and localStorage whenever it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('elevator-viewer-theme', theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return { theme, toggle };
}
