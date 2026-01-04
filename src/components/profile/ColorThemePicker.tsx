import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ColorTheme {
  name: string;
  primary: string;
  secondary?: string;
  type: 'solid' | 'neon' | 'dual';
}

const colorThemes: ColorTheme[] = [
  // Solid colors
  { name: 'Orange', primary: '20 90% 48%', type: 'solid' },
  { name: 'Blue', primary: '220 90% 48%', type: 'solid' },
  { name: 'Green', primary: '142 76% 36%', type: 'solid' },
  { name: 'Purple', primary: '271 76% 53%', type: 'solid' },
  { name: 'Red', primary: '0 72% 50%', type: 'solid' },
  { name: 'Pink', primary: '330 80% 50%', type: 'solid' },
  { name: 'Teal', primary: '180 70% 40%', type: 'solid' },
  { name: 'Yellow', primary: '45 93% 47%', type: 'solid' },
  { name: 'Indigo', primary: '239 84% 67%', type: 'solid' },
  { name: 'Cyan', primary: '190 95% 39%', type: 'solid' },
  { name: 'Lime', primary: '84 85% 35%', type: 'solid' },
  { name: 'Rose', primary: '350 89% 60%', type: 'solid' },
  // Neon colors
  { name: 'Neon Pink', primary: '320 100% 60%', type: 'neon' },
  { name: 'Neon Blue', primary: '210 100% 55%', type: 'neon' },
  { name: 'Neon Green', primary: '120 100% 45%', type: 'neon' },
  { name: 'Electric Purple', primary: '280 100% 60%', type: 'neon' },
  { name: 'Hot Magenta', primary: '300 100% 50%', type: 'neon' },
  { name: 'Cyber Yellow', primary: '55 100% 50%', type: 'neon' },
  { name: 'Aqua Glow', primary: '175 100% 45%', type: 'neon' },
  { name: 'Sunset Orange', primary: '25 100% 55%', type: 'neon' },
  { name: 'Violet Neon', primary: '260 100% 65%', type: 'neon' },
  { name: 'Coral Glow', primary: '15 100% 60%', type: 'neon' },
  { name: 'Mint Neon', primary: '160 100% 45%', type: 'neon' },
  { name: 'Gold Shimmer', primary: '42 100% 50%', type: 'neon' },
  // Dual-tone combinations
  { name: 'Ocean Sunset', primary: '200 90% 50%', secondary: '25 100% 55%', type: 'dual' },
  { name: 'Aurora', primary: '280 80% 55%', secondary: '160 90% 45%', type: 'dual' },
  { name: 'Fire & Ice', primary: '0 85% 55%', secondary: '200 100% 50%', type: 'dual' },
  { name: 'Cosmic', primary: '270 90% 60%', secondary: '320 100% 55%', type: 'dual' },
  { name: 'Forest Dawn', primary: '142 70% 40%', secondary: '35 95% 55%', type: 'dual' },
  { name: 'Miami Vice', primary: '320 100% 55%', secondary: '180 100% 45%', type: 'dual' },
  { name: 'Lava Lamp', primary: '15 100% 55%', secondary: '280 90% 55%', type: 'dual' },
  { name: 'Tropical', primary: '45 100% 50%', secondary: '160 100% 40%', type: 'dual' },
  { name: 'Nebula', primary: '250 90% 60%', secondary: '340 100% 60%', type: 'dual' },
  { name: 'Candy', primary: '340 90% 60%', secondary: '190 100% 50%', type: 'dual' },
  { name: 'Sunset Beach', primary: '35 100% 55%', secondary: '320 80% 55%', type: 'dual' },
  { name: 'Electric Storm', primary: '220 100% 55%', secondary: '55 100% 50%', type: 'dual' },
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

  const applyTheme = (theme: ColorTheme) => {
    const root = document.documentElement;
    
    // Apply primary color
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--ring', theme.primary);
    root.style.setProperty('--sidebar-primary', theme.primary);
    root.style.setProperty('--sidebar-ring', theme.primary);
    
    // Parse the HSL values
    const [h, s, l] = theme.primary.split(' ').map(v => parseFloat(v));
    
    // For dual-tone, use secondary color for some chart colors
    if (theme.type === 'dual' && theme.secondary) {
      const [h2, s2, l2] = theme.secondary.split(' ').map(v => parseFloat(v));
      root.style.setProperty('--chart-1', `${h} ${s}% ${Math.min(l + 12, 80)}%`);
      root.style.setProperty('--chart-2', `${h2} ${s2}% ${l2}%`);
      root.style.setProperty('--chart-3', `${h2} ${s2}% ${Math.min(l2 + 10, 76)}%`);
      root.style.setProperty('--chart-4', `${h} ${s}% ${Math.max(l - 5, 30)}%`);
    } else {
      root.style.setProperty('--chart-1', `${h} ${s}% ${Math.min(l + 12, 80)}%`);
      root.style.setProperty('--chart-2', `${(h + 23) % 360} ${s}% ${l}%`);
      root.style.setProperty('--chart-3', `${(h + 27) % 360} ${s}% ${Math.min(l + 5, 76)}%`);
      root.style.setProperty('--chart-4', `${(h + 4) % 360} ${s}% ${l}%`);
    }
    
    // Update accent colors
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      root.style.setProperty('--accent', `${h} 91% 14%`);
      root.style.setProperty('--accent-foreground', theme.secondary || `${(h + 23) % 360} ${s}% ${l}%`);
      root.style.setProperty('--sidebar-accent', theme.secondary || `${(h + 23) % 360} ${s}% ${l}%`);
      root.style.setProperty('--sidebar-accent-foreground', `${h} 91% 14%`);
    } else {
      root.style.setProperty('--accent', `${(h + 27) % 360} 100% 96%`);
      root.style.setProperty('--accent-foreground', theme.secondary || `${(h + 17) % 360} 92% 50%`);
      root.style.setProperty('--sidebar-accent', `${h} ${s}% 32%`);
      root.style.setProperty('--sidebar-accent-foreground', `${h} ${s}% 98%`);
    }

    // Add transition class for smooth color change
    document.documentElement.classList.add('theme-transitioning');
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 500);
  };

  const handleSelectTheme = (theme: ColorTheme) => {
    setSelectedTheme(theme.name);
    applyTheme(theme);
    localStorage.setItem('color-theme', theme.name);
    toast({ title: `Theme changed to ${theme.name}` });
  };

  const solidThemes = colorThemes.filter(t => t.type === 'solid');
  const neonThemes = colorThemes.filter(t => t.type === 'neon');
  const dualThemes = colorThemes.filter(t => t.type === 'dual');

  const renderDualPreview = (theme: ColorTheme) => (
    <div className="absolute inset-0 flex">
      <div 
        className="w-1/2 h-full"
        style={{ backgroundColor: `hsl(${theme.primary})` }}
      />
      <div 
        className="w-1/2 h-full"
        style={{ backgroundColor: `hsl(${theme.secondary})` }}
      />
    </div>
  );

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

        <div>
          <p className="text-sm text-muted-foreground mb-2">Dual-Tone Combos</p>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {dualThemes.map((theme) => (
              <Button
                key={theme.name}
                variant="outline"
                className="relative h-12 w-full p-0 overflow-hidden hover:scale-110 transition-transform"
                onClick={() => handleSelectTheme(theme)}
                title={theme.name}
              >
                {renderDualPreview(theme)}
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
