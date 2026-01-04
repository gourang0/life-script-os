import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const colorThemes = [
  // Solid colors
  { name: 'Orange', hue: '20', primary: '20 90% 48%', type: 'solid' },
  { name: 'Blue', hue: '220', primary: '220 90% 48%', type: 'solid' },
  { name: 'Green', hue: '142', primary: '142 76% 36%', type: 'solid' },
  { name: 'Purple', hue: '271', primary: '271 76% 53%', type: 'solid' },
  { name: 'Red', hue: '0', primary: '0 72% 50%', type: 'solid' },
  { name: 'Pink', hue: '330', primary: '330 80% 50%', type: 'solid' },
  { name: 'Teal', hue: '180', primary: '180 70% 40%', type: 'solid' },
  { name: 'Yellow', hue: '45', primary: '45 93% 47%', type: 'solid' },
  { name: 'Indigo', hue: '239', primary: '239 84% 67%', type: 'solid' },
  { name: 'Cyan', hue: '190', primary: '190 95% 39%', type: 'solid' },
  { name: 'Lime', hue: '84', primary: '84 85% 35%', type: 'solid' },
  { name: 'Rose', hue: '350', primary: '350 89% 60%', type: 'solid' },
  // Gradient/Neon colors
  { name: 'Neon Pink', hue: '320', primary: '320 100% 60%', type: 'neon' },
  { name: 'Neon Blue', hue: '210', primary: '210 100% 55%', type: 'neon' },
  { name: 'Neon Green', hue: '120', primary: '120 100% 45%', type: 'neon' },
  { name: 'Electric Purple', hue: '280', primary: '280 100% 60%', type: 'neon' },
  { name: 'Hot Magenta', hue: '300', primary: '300 100% 50%', type: 'neon' },
  { name: 'Cyber Yellow', hue: '55', primary: '55 100% 50%', type: 'neon' },
  { name: 'Aqua Glow', hue: '175', primary: '175 100% 45%', type: 'neon' },
  { name: 'Sunset Orange', hue: '25', primary: '25 100% 55%', type: 'neon' },
  { name: 'Violet Neon', hue: '260', primary: '260 100% 65%', type: 'neon' },
  { name: 'Coral Glow', hue: '15', primary: '15 100% 60%', type: 'neon' },
  { name: 'Mint Neon', hue: '160', primary: '160 100% 45%', type: 'neon' },
  { name: 'Gold Shimmer', hue: '42', primary: '42 100% 50%', type: 'neon' },
];

export function ColorThemePicker() {
  const [selectedTheme, setSelectedTheme] = useState<string>('Orange');

  useEffect(() => {
    const savedTheme = localStorage.getItem('color-theme');
    if (savedTheme) {
      setSelectedTheme(savedTheme);
      const theme = colorThemes.find(t => t.name === savedTheme);
      if (theme) {
        applyTheme(theme);
      }
    }
  }, []);

  const applyTheme = (theme: typeof colorThemes[0]) => {
    const root = document.documentElement;
    
    // Apply primary color to all theme-related CSS variables
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--ring', theme.primary);
    root.style.setProperty('--sidebar-primary', theme.primary);
    root.style.setProperty('--sidebar-ring', theme.primary);
    
    // Parse the HSL values
    const [h, s, l] = theme.primary.split(' ').map(v => parseFloat(v));
    
    // Update chart colors to match theme
    root.style.setProperty('--chart-1', `${h} ${s}% ${Math.min(l + 12, 80)}%`);
    root.style.setProperty('--chart-2', `${(h + 23) % 360} ${s}% ${l}%`);
    root.style.setProperty('--chart-3', `${(h + 27) % 360} ${s}% ${Math.min(l + 5, 76)}%`);
    root.style.setProperty('--chart-4', `${(h + 4) % 360} ${s}% ${l}%`);
    
    // Update accent colors
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      root.style.setProperty('--accent', `${h} 91% 14%`);
      root.style.setProperty('--accent-foreground', `${(h + 23) % 360} ${s}% ${l}%`);
      root.style.setProperty('--sidebar-accent', `${(h + 23) % 360} ${s}% ${l}%`);
      root.style.setProperty('--sidebar-accent-foreground', `${h} 91% 14%`);
    } else {
      root.style.setProperty('--accent', `${(h + 27) % 360} 100% 96%`);
      root.style.setProperty('--accent-foreground', `${(h + 17) % 360} 92% 50%`);
      root.style.setProperty('--sidebar-accent', `${h} ${s}% 32%`);
      root.style.setProperty('--sidebar-accent-foreground', `${h} ${s}% 98%`);
    }

    // Add transition class for smooth color change
    document.documentElement.classList.add('theme-transitioning');
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 500);
  };

  const handleSelectTheme = (theme: typeof colorThemes[0]) => {
    setSelectedTheme(theme.name);
    applyTheme(theme);
    localStorage.setItem('color-theme', theme.name);
    toast({ title: `Theme changed to ${theme.name}` });
  };

  const solidThemes = colorThemes.filter(t => t.type === 'solid');
  const neonThemes = colorThemes.filter(t => t.type === 'neon');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Color Theme
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Solid Colors</p>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {solidThemes.map((theme) => (
              <Button
                key={theme.name}
                variant="outline"
                className="relative h-12 w-full p-0 overflow-hidden hover:scale-105 transition-transform"
                onClick={() => handleSelectTheme(theme)}
                title={theme.name}
              >
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: `hsl(${theme.primary})` }}
                />
                {selectedTheme === theme.name && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/30">
                    <Check className="w-5 h-5 text-primary-foreground" />
                  </div>
                )}
              </Button>
            ))}
          </div>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground mb-2">Neon & Gradient Colors</p>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {neonThemes.map((theme) => (
              <Button
                key={theme.name}
                variant="outline"
                className="relative h-12 w-full p-0 overflow-hidden hover:scale-110 transition-transform"
                onClick={() => handleSelectTheme(theme)}
                title={theme.name}
              >
                <div
                  className="absolute inset-0"
                  style={{ 
                    backgroundColor: `hsl(${theme.primary})`,
                    boxShadow: `0 0 15px hsl(${theme.primary} / 0.6), inset 0 0 10px hsl(${theme.primary} / 0.3)`
                  }}
                />
                {selectedTheme === theme.name && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/30">
                    <Check className="w-5 h-5 text-primary-foreground" />
                  </div>
                )}
              </Button>
            ))}
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Selected: {selectedTheme}
        </p>
      </CardContent>
    </Card>
  );
}
