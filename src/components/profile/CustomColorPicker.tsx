import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Paintbrush, Save, RotateCcw, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CustomColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  card: string;
  muted: string;
}

const defaultColors: CustomColors = {
  primary: '#f97316',
  secondary: '#3b82f6',
  accent: '#8b5cf6',
  background: '#fafaf9',
  foreground: '#1c1917',
  card: '#ffffff',
  muted: '#e7e5e4',
};

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

function hslToHex(hsl: string): string {
  const match = hsl.match(/(\d+)\s+(\d+)%?\s+(\d+)%?/);
  if (!match) return '#ffffff';

  const h = parseInt(match[1]) / 360;
  const s = parseInt(match[2]) / 100;
  const l = parseInt(match[3]) / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function CustomColorPicker() {
  const [colors, setColors] = useState<CustomColors>(defaultColors);
  const [isCustomActive, setIsCustomActive] = useState(false);

  useEffect(() => {
    const savedCustomColors = localStorage.getItem('custom-theme-colors');
    const isActive = localStorage.getItem('custom-theme-active') === 'true';
    
    if (savedCustomColors) {
      try {
        setColors(JSON.parse(savedCustomColors));
      } catch {
        // Use defaults
      }
    }
    setIsCustomActive(isActive);
    
    if (isActive && savedCustomColors) {
      try {
        applyCustomTheme(JSON.parse(savedCustomColors));
      } catch {
        // Use defaults
      }
    }
  }, []);

  const applyCustomTheme = (customColors: CustomColors) => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    
    // Apply primary
    const primaryHSL = hexToHSL(customColors.primary);
    root.style.setProperty('--primary', primaryHSL);
    root.style.setProperty('--ring', primaryHSL);
    root.style.setProperty('--sidebar-primary', primaryHSL);
    root.style.setProperty('--glow-color', primaryHSL);
    
    // Apply secondary as accent-foreground
    const secondaryHSL = hexToHSL(customColors.secondary);
    root.style.setProperty('--accent-foreground', secondaryHSL);
    root.style.setProperty('--chart-2', secondaryHSL);
    
    // Apply accent
    const accentHSL = hexToHSL(customColors.accent);
    root.style.setProperty('--chart-3', accentHSL);
    root.style.setProperty('--badge-shine', accentHSL);
    
    // Apply background
    const bgHSL = hexToHSL(customColors.background);
    if (!isDark) {
      root.style.setProperty('--background', bgHSL);
    }
    
    // Apply card
    const cardHSL = hexToHSL(customColors.card);
    if (!isDark) {
      root.style.setProperty('--card', cardHSL);
      root.style.setProperty('--popover', cardHSL);
    }
    
    // Apply muted
    const mutedHSL = hexToHSL(customColors.muted);
    if (!isDark) {
      root.style.setProperty('--muted', mutedHSL);
      root.style.setProperty('--secondary', mutedHSL);
    }
    
    // Apply foreground
    const fgHSL = hexToHSL(customColors.foreground);
    if (!isDark) {
      root.style.setProperty('--foreground', fgHSL);
      root.style.setProperty('--card-foreground', fgHSL);
    }

    // Calculate chart colors from primary
    const [h, s, l] = primaryHSL.split(' ').map(v => parseFloat(v));
    root.style.setProperty('--chart-1', `${h} ${s}% ${Math.min(l + 12, 80)}%`);
    root.style.setProperty('--chart-4', `${(h + 30) % 360} ${s}% ${l}%`);
    root.style.setProperty('--chart-5', `${(h + 60) % 360} ${Math.max(s - 10, 40)}% ${Math.min(l + 5, 75)}%`);

    document.documentElement.classList.add('theme-transitioning');
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 500);
  };

  const handleColorChange = (key: keyof CustomColors, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyTheme = () => {
    applyCustomTheme(colors);
    localStorage.setItem('custom-theme-colors', JSON.stringify(colors));
    localStorage.setItem('custom-theme-active', 'true');
    localStorage.removeItem('color-theme'); // Clear preset theme
    setIsCustomActive(true);
    toast({ title: 'Custom theme applied!' });
  };

  const handleResetTheme = () => {
    setColors(defaultColors);
    localStorage.removeItem('custom-theme-colors');
    localStorage.removeItem('custom-theme-active');
    setIsCustomActive(false);
    
    // Reset to defaults
    const root = document.documentElement;
    root.style.removeProperty('--primary');
    root.style.removeProperty('--ring');
    root.style.removeProperty('--accent-foreground');
    root.style.removeProperty('--chart-1');
    root.style.removeProperty('--chart-2');
    root.style.removeProperty('--chart-3');
    root.style.removeProperty('--chart-4');
    root.style.removeProperty('--chart-5');
    root.style.removeProperty('--background');
    root.style.removeProperty('--card');
    root.style.removeProperty('--popover');
    root.style.removeProperty('--muted');
    root.style.removeProperty('--secondary');
    root.style.removeProperty('--foreground');
    root.style.removeProperty('--card-foreground');
    
    toast({ title: 'Theme reset to default' });
  };

  const colorFields: { key: keyof CustomColors; label: string; description: string }[] = [
    { key: 'primary', label: 'Primary', description: 'Main brand color, buttons, links' },
    { key: 'secondary', label: 'Secondary', description: 'Accent elements, charts' },
    { key: 'accent', label: 'Accent', description: 'Highlights, badges, tertiary elements' },
    { key: 'background', label: 'Background', description: 'Page background' },
    { key: 'card', label: 'Card', description: 'Card backgrounds' },
    { key: 'muted', label: 'Muted', description: 'Subtle backgrounds, borders' },
    { key: 'foreground', label: 'Text', description: 'Main text color' },
  ];

  return (
    <Card className="border-2 border-dashed border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paintbrush className="w-5 h-5 text-primary" />
          Custom Color Picker
          {isCustomActive && (
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Active</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Create your own personalized theme by choosing any colors you want.
        </p>

        {/* Color Preview */}
        <div className="flex gap-1 h-8 rounded-lg overflow-hidden border border-border">
          {Object.values(colors).map((color, i) => (
            <div
              key={i}
              className="flex-1 transition-all duration-300"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Color Inputs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {colorFields.map(({ key, label, description }) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border border-border"
                  style={{ backgroundColor: colors[key] }}
                />
                {label}
              </Label>
              <Input
                type="color"
                value={colors[key]}
                onChange={(e) => handleColorChange(key, e.target.value)}
                className="h-10 p-1 cursor-pointer"
              />
              <p className="text-[10px] text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button onClick={handleApplyTheme} className="flex-1">
            <Sparkles className="w-4 h-4 mr-2" />
            Apply Custom Theme
          </Button>
          <Button variant="outline" onClick={handleResetTheme}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
