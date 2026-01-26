import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Check, Droplets, SwatchBook } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CustomColorPicker } from './CustomColorPicker';

interface PresetPalette {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: { light: string; dark: string };
  description: string;
}

interface BackgroundOption {
  name: string;
  light: string;
  dark: string;
}

// Popular preset palettes
const presetPalettes: PresetPalette[] = [
  {
    name: 'Material Blue',
    primary: '217 91% 60%',
    secondary: '199 89% 48%',
    accent: '291 64% 42%',
    background: { light: '0 0% 98%', dark: '220 13% 10%' },
    description: 'Google Material Design Blue'
  },
  {
    name: 'Material Teal',
    primary: '174 100% 29%',
    secondary: '187 100% 42%',
    accent: '340 82% 52%',
    background: { light: '0 0% 98%', dark: '220 13% 10%' },
    description: 'Google Material Design Teal'
  },
  {
    name: 'Material Purple',
    primary: '262 52% 47%',
    secondary: '291 47% 51%',
    accent: '4 90% 58%',
    background: { light: '0 0% 98%', dark: '220 13% 10%' },
    description: 'Google Material Design Purple'
  },
  {
    name: 'Nord Frost',
    primary: '193 43% 67%',
    secondary: '179 25% 65%',
    accent: '210 34% 63%',
    background: { light: '220 16% 96%', dark: '220 16% 14%' },
    description: 'Arctic, north-bluish colors'
  },
  {
    name: 'Nord Aurora',
    primary: '354 42% 56%',
    secondary: '14 51% 63%',
    accent: '40 71% 73%',
    background: { light: '220 16% 96%', dark: '220 16% 14%' },
    description: 'Warm aurora-inspired Nord'
  },
  {
    name: 'Dracula',
    primary: '265 89% 78%',
    secondary: '135 94% 65%',
    accent: '326 100% 74%',
    background: { light: '231 15% 95%', dark: '231 15% 18%' },
    description: 'Dark theme for vampires'
  },
  {
    name: 'Monokai',
    primary: '80 76% 53%',
    secondary: '54 70% 68%',
    accent: '338 95% 56%',
    background: { light: '70 8% 94%', dark: '70 8% 15%' },
    description: 'Classic code editor theme'
  },
  {
    name: 'Solarized',
    primary: '18 89% 55%',
    secondary: '175 59% 40%',
    accent: '237 45% 58%',
    background: { light: '44 87% 94%', dark: '192 100% 11%' },
    description: 'Ethan Schoonover\'s classic'
  },
  {
    name: 'Tokyo Night',
    primary: '230 55% 72%',
    secondary: '180 66% 69%',
    accent: '340 68% 69%',
    background: { light: '220 13% 95%', dark: '235 21% 13%' },
    description: 'Tokyo city lights inspired'
  },
  {
    name: 'Catppuccin Mocha',
    primary: '267 84% 81%',
    secondary: '189 71% 73%',
    accent: '343 81% 75%',
    background: { light: '240 21% 95%', dark: '240 21% 15%' },
    description: 'Soothing pastel theme'
  },
  {
    name: 'One Dark',
    primary: '207 82% 66%',
    secondary: '95 38% 62%',
    accent: '286 60% 67%',
    background: { light: '220 13% 95%', dark: '220 13% 18%' },
    description: 'Atom\'s signature theme'
  },
  {
    name: 'Gruvbox',
    primary: '27 94% 58%',
    secondary: '61 66% 44%',
    accent: '157 47% 41%',
    background: { light: '48 45% 92%', dark: '0 0% 16%' },
    description: 'Retro groove colors'
  },
  {
    name: 'Synthwave',
    primary: '316 70% 60%',
    secondary: '180 100% 50%',
    accent: '51 100% 50%',
    background: { light: '260 20% 95%', dark: '260 40% 10%' },
    description: '80s retro neon vibes'
  },
  {
    name: 'GitHub Light',
    primary: '215 69% 43%',
    secondary: '130 44% 44%',
    accent: '339 90% 51%',
    background: { light: '0 0% 100%', dark: '215 28% 17%' },
    description: 'GitHub\'s clean aesthetic'
  },
  {
    name: 'Everforest',
    primary: '142 40% 54%',
    secondary: '165 35% 48%',
    accent: '35 74% 63%',
    background: { light: '44 22% 93%', dark: '220 17% 17%' },
    description: 'Comfortable green tones'
  }
];

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

export function ColorThemePicker() {
  const [selectedPalette, setSelectedPalette] = useState<string>('');
  const [selectedBackground, setSelectedBackground] = useState<string>('Off White');

  // Helper to apply palette based on current mode
  const applyPaletteForCurrentMode = (paletteName: string) => {
    const palette = presetPalettes.find(p => p.name === paletteName);
    if (palette) {
      applyPresetPalette(palette);
    }
  };

  useEffect(() => {
    const savedPalette = localStorage.getItem('preset-palette');
    const savedBackground = localStorage.getItem('background-color');
    
    if (savedPalette) {
      setSelectedPalette(savedPalette);
      // Apply palette on initial load
      const palette = presetPalettes.find(p => p.name === savedPalette);
      if (palette) {
        applyPresetPalette(palette);
      }
    }
    
    if (savedBackground) {
      setSelectedBackground(savedBackground);
      const bg = backgroundOptions.find(b => b.name === savedBackground);
      if (bg) {
        applyBackground(bg);
      }
    }

    // Listen for theme mode changes (light/dark toggle)
    const handleThemeModeChange = () => {
      const currentPalette = localStorage.getItem('preset-palette');
      if (currentPalette) {
        const palette = presetPalettes.find(p => p.name === currentPalette);
        if (palette) {
          setTimeout(() => applyPresetPalette(palette), 100);
        }
      }
      const currentBg = localStorage.getItem('background-color');
      if (currentBg) {
        const bg = backgroundOptions.find(b => b.name === currentBg);
        if (bg) {
          setTimeout(() => applyBackground(bg), 100);
        }
      }
    };

    window.addEventListener('theme-mode-changed', handleThemeModeChange);
    return () => window.removeEventListener('theme-mode-changed', handleThemeModeChange);
  }, []);

  const applyBackground = (bg: BackgroundOption) => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    
    const bgValue = isDark ? bg.dark : bg.light;
    root.style.setProperty('--background', bgValue);
    
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

  const applyPresetPalette = (palette: PresetPalette) => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    
    // Apply primary color
    root.style.setProperty('--primary', palette.primary);
    root.style.setProperty('--ring', palette.primary);
    root.style.setProperty('--sidebar-primary', palette.primary);
    root.style.setProperty('--sidebar-ring', palette.primary);
    root.style.setProperty('--glow-color', palette.primary);
    
    // Parse HSL values
    const [h, s, l] = palette.primary.split(' ').map(v => parseFloat(v));
    const [h2, s2, l2] = palette.secondary.split(' ').map(v => parseFloat(v));
    
    // Apply chart colors
    root.style.setProperty('--chart-1', `${h} ${s}% ${Math.min(l + 12, 80)}%`);
    root.style.setProperty('--chart-2', palette.secondary);
    root.style.setProperty('--chart-3', palette.accent);
    root.style.setProperty('--chart-4', `${h} ${s}% ${Math.max(l - 5, 30)}%`);
    root.style.setProperty('--chart-5', `${h2} ${s2}% ${Math.min(l2 + 10, 80)}%`);
    root.style.setProperty('--badge-shine', palette.accent);
    
    // Apply accent colors
    if (isDark) {
      root.style.setProperty('--accent', `${h} 91% 14%`);
      root.style.setProperty('--accent-foreground', palette.secondary);
      root.style.setProperty('--sidebar-accent', palette.secondary);
      root.style.setProperty('--sidebar-accent-foreground', `${h} 91% 14%`);
    } else {
      root.style.setProperty('--accent', `${h} 100% 96%`);
      root.style.setProperty('--accent-foreground', palette.secondary);
      root.style.setProperty('--sidebar-accent', `${h} ${s}% 32%`);
      root.style.setProperty('--sidebar-accent-foreground', `${h} ${s}% 98%`);
    }
    
    // Apply background
    const bgValue = isDark ? palette.background.dark : palette.background.light;
    root.style.setProperty('--background', bgValue);
    
    const [bgH, bgS, bgL] = bgValue.split(' ').map(v => parseFloat(v));
    
    if (isDark) {
      root.style.setProperty('--card', `${bgH} ${Math.max(bgS - 2, 0)}% ${Math.min(bgL + 4, 22)}%`);
      root.style.setProperty('--popover', `${bgH} ${Math.max(bgS - 2, 0)}% ${Math.min(bgL + 6, 25)}%`);
      root.style.setProperty('--secondary', `${bgH} ${Math.max(bgS - 2, 0)}% ${Math.min(bgL + 12, 32)}%`);
      root.style.setProperty('--muted', `${bgH} ${Math.max(bgS - 4, 0)}% ${Math.min(bgL + 18, 38)}%`);
      root.style.setProperty('--border', `${bgH} ${Math.max(bgS - 2, 0)}% ${Math.min(bgL + 14, 30)}%`);
      root.style.setProperty('--input', `${bgH} ${Math.max(bgS - 2, 0)}% ${Math.min(bgL + 14, 30)}%`);
      root.style.setProperty('--sidebar-background', `${bgH} ${Math.max(bgS - 2, 0)}% ${Math.min(bgL + 2, 16)}%`);
      root.style.setProperty('--sidebar', `${bgH} ${Math.max(bgS - 2, 0)}% ${Math.min(bgL + 4, 18)}%`);
      root.style.setProperty('--sidebar-border', `${bgH} ${Math.max(bgS - 2, 0)}% ${Math.min(bgL + 14, 30)}%`);
    } else {
      root.style.setProperty('--card', `${bgH} ${Math.max(bgS - 3, 0)}% ${Math.min(bgL + 2, 100)}%`);
      root.style.setProperty('--popover', `${bgH} ${Math.max(bgS - 5, 0)}% ${Math.max(bgL - 2, 92)}%`);
      root.style.setProperty('--secondary', `${bgH} ${Math.max(bgS - 5, 0)}% ${Math.max(bgL - 8, 88)}%`);
      root.style.setProperty('--muted', `${bgH} ${Math.max(bgS - 7, 0)}% ${Math.max(bgL - 14, 82)}%`);
      root.style.setProperty('--border', `${bgH} ${Math.max(bgS - 5, 0)}% ${Math.max(bgL - 11, 85)}%`);
      root.style.setProperty('--input', `${bgH} ${Math.max(bgS - 5, 0)}% ${Math.max(bgL - 11, 85)}%`);
      root.style.setProperty('--sidebar-background', `${bgH} ${Math.max(bgS - 3, 0)}% ${Math.min(bgL + 1, 98)}%`);
      root.style.setProperty('--sidebar', `${bgH} ${Math.max(bgS - 3, 0)}% ${Math.min(bgL + 1, 98)}%`);
      root.style.setProperty('--sidebar-border', `${bgH} ${Math.max(bgS - 5, 0)}% ${Math.max(bgL - 11, 85)}%`);
    }
    
    document.documentElement.classList.add('theme-transitioning');
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 500);
  };

  const handleSelectPalette = (paletteName: string) => {
    setSelectedPalette(paletteName);
    const palette = presetPalettes.find(p => p.name === paletteName);
    if (palette) {
      applyPresetPalette(palette);
      localStorage.setItem('preset-palette', paletteName);
      localStorage.removeItem('custom-theme-active');
      localStorage.removeItem('color-theme');
      toast.success(`Applied ${paletteName} theme`);
    }
  };

  const handleSelectBackground = (bgName: string) => {
    setSelectedBackground(bgName);
    const bg = backgroundOptions.find(b => b.name === bgName);
    if (bg) {
      applyBackground(bg);
      localStorage.setItem('background-color', bgName);
      toast.success(`Background changed to ${bgName}`);
    }
  };

  const currentPalette = presetPalettes.find(p => p.name === selectedPalette);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          Color Theme
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Preset Palette Dropdown */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <SwatchBook className="w-4 h-4 text-primary" />
            Preset Palettes
          </div>
          <Select value={selectedPalette} onValueChange={handleSelectPalette}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a preset theme palette" />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {presetPalettes.map((palette) => (
                <SelectItem key={palette.name} value={palette.name}>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-0.5 w-12 h-4 rounded overflow-hidden border border-border">
                      <div className="flex-1" style={{ backgroundColor: `hsl(${palette.primary})` }} />
                      <div className="flex-1" style={{ backgroundColor: `hsl(${palette.secondary})` }} />
                      <div className="flex-1" style={{ backgroundColor: `hsl(${palette.accent})` }} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{palette.name}</span>
                      <span className="text-xs text-muted-foreground">{palette.description}</span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {currentPalette && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Check className="w-3 h-3 text-primary" />
              {currentPalette.description}
            </div>
          )}
        </div>

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
                    <div className="flex w-8 h-4 rounded border border-border overflow-hidden">
                      <div className="flex-1" style={{ backgroundColor: `hsl(${bg.light})` }} />
                      <div className="flex-1" style={{ backgroundColor: `hsl(${bg.dark})` }} />
                    </div>
                    <span>{bg.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Palette Preview Grid */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Quick Select</p>
          <div className="grid grid-cols-5 gap-2">
            {presetPalettes.slice(0, 10).map((palette) => (
              <Button
                key={palette.name}
                variant="outline"
                className="relative h-12 w-full p-0 overflow-hidden hover:scale-105 transition-transform"
                onClick={() => handleSelectPalette(palette.name)}
                title={`${palette.name}: ${palette.description}`}
              >
                <div className="absolute inset-0 flex">
                  <div className="flex-1" style={{ backgroundColor: `hsl(${palette.primary})` }} />
                  <div className="flex-1" style={{ backgroundColor: `hsl(${palette.secondary})` }} />
                  <div className="flex-1" style={{ backgroundColor: `hsl(${palette.accent})` }} />
                </div>
                {selectedPalette === palette.name && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/40">
                    <Check className="w-4 h-4 text-primary-foreground drop-shadow-md" />
                  </div>
                )}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Current Selection */}
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Theme: <span className="font-medium text-foreground">{selectedPalette || 'None'}</span>
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
