import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Check, Gamepad2, Zap, Sparkles, Droplets } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CustomColorPicker } from './CustomColorPicker';

interface ColorTheme {
  name: string;
  primary: string;
  secondary?: string;
  accent?: string;
  type: 'solid' | 'neon' | 'dual' | 'gamified';
}

interface BackgroundOption {
  name: string;
  light: string;
  dark: string;
}

const backgroundOptions: BackgroundOption[] = [
  { name: 'Off White', light: '40 15% 96%', dark: '30 8% 8%' },
  { name: 'Pure White', light: '0 0% 100%', dark: '0 0% 6%' },
  { name: 'Warm Cream', light: '35 25% 95%', dark: '35 12% 8%' },
  { name: 'Cool Gray', light: '220 15% 96%', dark: '220 15% 7%' },
  { name: 'Soft Lavender', light: '260 18% 96%', dark: '260 15% 8%' },
  { name: 'Mint Fresh', light: '160 18% 96%', dark: '160 15% 8%' },
  { name: 'Warm Sand', light: '30 22% 95%', dark: '30 15% 7%' },
  { name: 'Slate Blue', light: '215 18% 96%', dark: '215 20% 7%' },
  { name: 'Blush Pink', light: '350 20% 96%', dark: '350 15% 8%' },
  { name: 'Forest Mist', light: '140 15% 96%', dark: '140 12% 8%' },
];

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
  // Gamified themes (full combos)
  { name: 'XP Hunter', primary: '45 95% 50%', secondary: '25 90% 55%', accent: '15 85% 50%', type: 'gamified' },
  { name: 'Level Master', primary: '260 80% 55%', secondary: '280 75% 60%', accent: '300 70% 55%', type: 'gamified' },
  { name: 'Streak Champion', primary: '15 90% 55%', secondary: '0 85% 55%', accent: '340 80% 55%', type: 'gamified' },
  { name: 'Quest Hero', primary: '200 90% 50%', secondary: '180 80% 45%', accent: '160 70% 45%', type: 'gamified' },
  { name: 'Achievement Pro', primary: '140 70% 45%', secondary: '160 65% 50%', accent: '80 60% 50%', type: 'gamified' },
  { name: 'Power Gamer', primary: '280 85% 55%', secondary: '320 80% 55%', accent: '0 90% 55%', type: 'gamified' },
  { name: 'Boss Mode', primary: '0 0% 20%', secondary: '45 95% 55%', accent: '0 85% 55%', type: 'gamified' },
  { name: 'Neon Arcade', primary: '300 100% 60%', secondary: '180 100% 50%', accent: '60 100% 50%', type: 'gamified' },
  { name: 'Retro Wave', primary: '320 90% 55%', secondary: '200 100% 55%', accent: '280 85% 60%', type: 'gamified' },
  { name: 'Cyber Punk', primary: '60 100% 50%', secondary: '180 100% 50%', accent: '300 100% 55%', type: 'gamified' },
];

export function ColorThemePicker() {
  const [selectedTheme, setSelectedTheme] = useState<string>('Orange');
  const [selectedBackground, setSelectedBackground] = useState<string>('Off White');

  useEffect(() => {
    const savedTheme = localStorage.getItem('color-theme');
    const savedBackground = localStorage.getItem('background-color');
    
    if (savedTheme) {
      setSelectedTheme(savedTheme);
      const theme = colorThemes.find(t => t.name === savedTheme);
      if (theme) {
        applyTheme(theme);
      }
    }
    
    if (savedBackground) {
      setSelectedBackground(savedBackground);
      const bg = backgroundOptions.find(b => b.name === savedBackground);
      if (bg) {
        applyBackground(bg);
      }
    }
  }, []);

  const applyBackground = (bg: BackgroundOption) => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    
    const bgValue = isDark ? bg.dark : bg.light;
    root.style.setProperty('--background', bgValue);
    
    // Parse and adjust related colors
    const [h, s, l] = bgValue.split(' ').map(v => parseFloat(v));
    
    if (isDark) {
      root.style.setProperty('--card', `${h} ${Math.max(s - 2, 0)}% ${Math.min(l + 4, 20)}%`);
      root.style.setProperty('--popover', `${h} ${Math.max(s - 2, 0)}% ${Math.min(l + 7, 25)}%`);
      root.style.setProperty('--secondary', `${h} ${Math.max(s - 2, 0)}% ${Math.min(l + 12, 30)}%`);
      root.style.setProperty('--muted', `${h} ${Math.max(s - 4, 0)}% ${Math.min(l + 17, 35)}%`);
      root.style.setProperty('--border', `${h} ${Math.max(s - 2, 0)}% ${Math.min(l + 14, 28)}%`);
      root.style.setProperty('--input', `${h} ${Math.max(s - 2, 0)}% ${Math.min(l + 14, 28)}%`);
      root.style.setProperty('--sidebar-background', `${h} ${Math.max(s - 2, 0)}% ${Math.min(l + 2, 15)}%`);
      root.style.setProperty('--sidebar', `${h} ${Math.max(s - 2, 0)}% ${Math.min(l + 4, 18)}%`);
      root.style.setProperty('--sidebar-border', `${h} ${Math.max(s - 2, 0)}% ${Math.min(l + 14, 28)}%`);
    } else {
      root.style.setProperty('--card', `${h} ${Math.max(s - 3, 0)}% ${Math.min(l + 2, 100)}%`);
      root.style.setProperty('--popover', `${h} ${Math.max(s - 5, 0)}% ${Math.max(l - 2, 90)}%`);
      root.style.setProperty('--secondary', `${h} ${Math.max(s - 5, 0)}% ${Math.max(l - 8, 85)}%`);
      root.style.setProperty('--muted', `${h} ${Math.max(s - 7, 0)}% ${Math.max(l - 14, 78)}%`);
      root.style.setProperty('--border', `${h} ${Math.max(s - 5, 0)}% ${Math.max(l - 11, 82)}%`);
      root.style.setProperty('--input', `${h} ${Math.max(s - 5, 0)}% ${Math.max(l - 11, 82)}%`);
      root.style.setProperty('--sidebar-background', `${h} ${Math.max(s - 3, 0)}% ${Math.min(l + 1, 98)}%`);
      root.style.setProperty('--sidebar', `${h} ${Math.max(s - 3, 0)}% ${Math.min(l + 1, 98)}%`);
      root.style.setProperty('--sidebar-border', `${h} ${Math.max(s - 5, 0)}% ${Math.max(l - 11, 82)}%`);
    }
  };

  const applyTheme = (theme: ColorTheme) => {
    const root = document.documentElement;
    
    // Apply primary color
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--ring', theme.primary);
    root.style.setProperty('--sidebar-primary', theme.primary);
    root.style.setProperty('--sidebar-ring', theme.primary);
    root.style.setProperty('--glow-color', theme.primary);
    
    // Parse the HSL values
    const [h, s, l] = theme.primary.split(' ').map(v => parseFloat(v));
    
    // For dual-tone and gamified, use secondary color for some chart colors
    if ((theme.type === 'dual' || theme.type === 'gamified') && theme.secondary) {
      const [h2, s2, l2] = theme.secondary.split(' ').map(v => parseFloat(v));
      root.style.setProperty('--chart-1', `${h} ${s}% ${Math.min(l + 12, 80)}%`);
      root.style.setProperty('--chart-2', `${h2} ${s2}% ${l2}%`);
      root.style.setProperty('--chart-3', `${h2} ${s2}% ${Math.min(l2 + 10, 76)}%`);
      root.style.setProperty('--chart-4', `${h} ${s}% ${Math.max(l - 5, 30)}%`);
      
      // Apply accent for gamified themes
      if (theme.type === 'gamified' && theme.accent) {
        root.style.setProperty('--badge-shine', theme.accent);
        root.style.setProperty('--chart-5', theme.accent);
      }
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

  const handleSelectBackground = (bgName: string) => {
    setSelectedBackground(bgName);
    const bg = backgroundOptions.find(b => b.name === bgName);
    if (bg) {
      applyBackground(bg);
      localStorage.setItem('background-color', bgName);
      toast({ title: `Background changed to ${bgName}` });
    }
  };

  const solidThemes = colorThemes.filter(t => t.type === 'solid');
  const neonThemes = colorThemes.filter(t => t.type === 'neon');
  const dualThemes = colorThemes.filter(t => t.type === 'dual');
  const gamifiedThemes = colorThemes.filter(t => t.type === 'gamified');

  const renderThemePreview = (theme: ColorTheme) => {
    if (theme.type === 'dual' || theme.type === 'gamified') {
      return (
        <div className="absolute inset-0 flex overflow-hidden rounded-md">
          <div 
            className="flex-1"
            style={{ backgroundColor: `hsl(${theme.primary})` }}
          />
          <div 
            className="flex-1"
            style={{ backgroundColor: `hsl(${theme.secondary})` }}
          />
          {theme.accent && (
            <div 
              className="absolute bottom-0 left-0 right-0 h-1"
              style={{ backgroundColor: `hsl(${theme.accent})` }}
            />
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          Color Theme
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Background Color Selector */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Droplets className="w-4 h-4 text-muted-foreground" />
            Background Color
          </div>
          <Select value={selectedBackground} onValueChange={handleSelectBackground}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select background color" />
            </SelectTrigger>
            <SelectContent>
              {backgroundOptions.map((bg) => (
                <SelectItem key={bg.name} value={bg.name}>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-5 h-5 rounded border border-border"
                      style={{ backgroundColor: `hsl(${bg.light})` }}
                    />
                    <span>{bg.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Gamified Combos - Featured */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Gamepad2 className="w-4 h-4 text-primary" />
            Gamified Combos
          </div>
          <div className="grid grid-cols-5 gap-2">
            {gamifiedThemes.map((theme) => (
              <Button
                key={theme.name}
                variant="outline"
                className="relative h-14 w-full p-0 overflow-hidden hover:scale-105 transition-transform"
                onClick={() => handleSelectTheme(theme)}
                title={theme.name}
              >
                {renderThemePreview(theme)}
                {selectedTheme === theme.name && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/40">
                    <Check className="w-5 h-5 text-primary-foreground drop-shadow-md" />
                  </div>
                )}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Full color combos with primary, secondary & accent colors
          </p>
        </div>

        {/* Solid Colors */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Solid Colors</p>
          <div className="grid grid-cols-6 gap-2">
            {solidThemes.map((theme) => (
              <Button
                key={theme.name}
                variant="outline"
                className="relative h-10 w-full p-0 overflow-hidden hover:scale-105 transition-transform"
                onClick={() => handleSelectTheme(theme)}
                title={theme.name}
              >
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: `hsl(${theme.primary})` }}
                />
                {selectedTheme === theme.name && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/30">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Neon Colors */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Zap className="w-4 h-4 text-muted-foreground" />
            Neon Glow
          </div>
          <div className="grid grid-cols-6 gap-2">
            {neonThemes.map((theme) => (
              <Button
                key={theme.name}
                variant="outline"
                className="relative h-10 w-full p-0 overflow-hidden hover:scale-110 transition-transform"
                onClick={() => handleSelectTheme(theme)}
                title={theme.name}
              >
                <div
                  className="absolute inset-0"
                  style={{ 
                    backgroundColor: `hsl(${theme.primary})`,
                    boxShadow: `0 0 12px hsl(${theme.primary} / 0.6), inset 0 0 8px hsl(${theme.primary} / 0.3)`
                  }}
                />
                {selectedTheme === theme.name && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/30">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Dual-Tone */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="w-4 h-4 text-muted-foreground" />
            Dual-Tone Combos
          </div>
          <div className="grid grid-cols-6 gap-2">
            {dualThemes.map((theme) => (
              <Button
                key={theme.name}
                variant="outline"
                className="relative h-10 w-full p-0 overflow-hidden hover:scale-110 transition-transform"
                onClick={() => handleSelectTheme(theme)}
                title={theme.name}
              >
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
                {selectedTheme === theme.name && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/30">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Current Selection */}
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Theme: <span className="font-medium text-foreground">{selectedTheme}</span>
            {' • '}
            Background: <span className="font-medium text-foreground">{selectedBackground}</span>
          </p>
        </div>
      </CardContent>

      {/* Custom Color Picker */}
      <CustomColorPicker />
    </Card>
  );
}
