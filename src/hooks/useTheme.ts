import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

// Helper to convert hex to HSL
function hexToHSL(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0 0% 50%';

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

interface CustomColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  card: string;
  muted: string;
}

interface SavedTheme {
  id: string;
  name: string;
  lightColors: CustomColors;
  darkColors: CustomColors;
  createdAt: number;
}

function applyCustomThemeColors(colors: CustomColors, isDark: boolean) {
  const root = document.documentElement;
  
  // Apply primary
  const primaryHSL = hexToHSL(colors.primary);
  root.style.setProperty('--primary', primaryHSL);
  root.style.setProperty('--ring', primaryHSL);
  root.style.setProperty('--sidebar-primary', primaryHSL);
  root.style.setProperty('--glow-color', primaryHSL);
  
  // Apply secondary
  const secondaryHSL = hexToHSL(colors.secondary);
  root.style.setProperty('--accent-foreground', secondaryHSL);
  root.style.setProperty('--chart-2', secondaryHSL);
  
  // Apply accent
  const accentHSL = hexToHSL(colors.accent);
  root.style.setProperty('--chart-3', accentHSL);
  root.style.setProperty('--badge-shine', accentHSL);
  
  // Apply background
  const bgHSL = hexToHSL(colors.background);
  root.style.setProperty('--background', bgHSL);
  
  // Apply card
  const cardHSL = hexToHSL(colors.card);
  root.style.setProperty('--card', cardHSL);
  root.style.setProperty('--popover', cardHSL);
  
  // Apply muted
  const mutedHSL = hexToHSL(colors.muted);
  root.style.setProperty('--muted', mutedHSL);
  root.style.setProperty('--secondary', mutedHSL);
  
  // Apply foreground
  const fgHSL = hexToHSL(colors.foreground);
  root.style.setProperty('--foreground', fgHSL);
  root.style.setProperty('--card-foreground', fgHSL);
  root.style.setProperty('--popover-foreground', fgHSL);

  // Calculate chart colors
  const [h, s, l] = primaryHSL.split(' ').map(v => parseFloat(v));
  root.style.setProperty('--chart-1', `${h} ${s}% ${Math.min(l + 12, 80)}%`);
  root.style.setProperty('--chart-4', `${(h + 30) % 360} ${s}% ${l}%`);
  root.style.setProperty('--chart-5', `${(h + 60) % 360} ${Math.max(s - 10, 40)}% ${Math.min(l + 5, 75)}%`);

  // Calculate border and input colors
  const [bgH, bgS, bgL] = bgHSL.split(' ').map(v => parseFloat(v));
  if (isDark) {
    root.style.setProperty('--border', `${bgH} ${Math.max(bgS - 2, 0)}% ${Math.min(bgL + 14, 28)}%`);
    root.style.setProperty('--input', `${bgH} ${Math.max(bgS - 2, 0)}% ${Math.min(bgL + 14, 28)}%`);
    root.style.setProperty('--sidebar-background', `${bgH} ${Math.max(bgS - 2, 0)}% ${Math.min(bgL + 2, 15)}%`);
    root.style.setProperty('--sidebar-border', `${bgH} ${Math.max(bgS - 2, 0)}% ${Math.min(bgL + 14, 28)}%`);
    root.style.setProperty('--muted-foreground', `${bgH} ${Math.max(bgS - 5, 0)}% 65%`);
  } else {
    root.style.setProperty('--border', `${bgH} ${Math.max(bgS - 5, 0)}% ${Math.max(bgL - 11, 82)}%`);
    root.style.setProperty('--input', `${bgH} ${Math.max(bgS - 5, 0)}% ${Math.max(bgL - 11, 82)}%`);
    root.style.setProperty('--sidebar-background', `${bgH} ${Math.max(bgS - 3, 0)}% ${Math.min(bgL + 1, 98)}%`);
    root.style.setProperty('--sidebar-border', `${bgH} ${Math.max(bgS - 5, 0)}% ${Math.max(bgL - 11, 82)}%`);
    root.style.setProperty('--muted-foreground', `${bgH} ${Math.max(bgS - 5, 0)}% 45%`);
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'system';
    }
    return 'system';
  });

  const applyCustomTheme = useCallback((isDark: boolean) => {
    const isCustomActive = localStorage.getItem('custom-theme-active') === 'true';
    const activeThemeId = localStorage.getItem('active-custom-theme-id');
    
    if (isCustomActive && activeThemeId) {
      const savedThemes = localStorage.getItem('saved-custom-themes');
      if (savedThemes) {
        try {
          const themes: SavedTheme[] = JSON.parse(savedThemes);
          const activeTheme = themes.find(t => t.id === activeThemeId);
          if (activeTheme) {
            const colors = isDark ? activeTheme.darkColors : activeTheme.lightColors;
            applyCustomThemeColors(colors, isDark);
          }
        } catch {
          // Ignore errors
        }
      }
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = (resolvedTheme: 'light' | 'dark') => {
      if (resolvedTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      // Apply custom theme colors if active
      setTimeout(() => {
        applyCustomTheme(resolvedTheme === 'dark');
      }, 50);
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches ? 'dark' : 'light');
      
      const handler = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      applyTheme(theme);
    }
    
    localStorage.setItem('theme', theme);
  }, [theme, applyCustomTheme]);

  return { theme, setTheme };
}
