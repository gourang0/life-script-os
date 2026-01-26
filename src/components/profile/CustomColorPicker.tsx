import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  RotateCcw, Sparkles, Sun, Moon, Plus, Trash2, Check
} from 'lucide-react';
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

interface SavedTheme {
  id: string;
  name: string;
  lightColors: CustomColors;
  darkColors: CustomColors;
  createdAt: number;
}

const defaultLightColors: CustomColors = {
  primary: '#f97316',
  secondary: '#3b82f6',
  accent: '#8b5cf6',
  background: '#fafaf9',
  foreground: '#1c1917',
  card: '#ffffff',
  muted: '#e7e5e4',
};

const defaultDarkColors: CustomColors = {
  primary: '#f97316',
  secondary: '#60a5fa',
  accent: '#a78bfa',
  background: '#0c0a09',
  foreground: '#fafaf9',
  card: '#1c1917',
  muted: '#292524',
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

export function CustomColorPicker() {
  const [lightColors, setLightColors] = useState<CustomColors>(defaultLightColors);
  const [darkColors, setDarkColors] = useState<CustomColors>(defaultDarkColors);
  const [isCustomActive, setIsCustomActive] = useState(false);
  const [savedThemes, setSavedThemes] = useState<SavedTheme[]>([]);
  const [newThemeName, setNewThemeName] = useState('');
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Load saved themes
    const saved = localStorage.getItem('saved-custom-themes');
    if (saved) {
      try {
        setSavedThemes(JSON.parse(saved));
      } catch {
        // Use empty array
      }
    }

    // Load active custom theme
    const activeId = localStorage.getItem('active-custom-theme-id');
    const isActive = localStorage.getItem('custom-theme-active') === 'true';
    
    if (activeId && isActive) {
      setActiveThemeId(activeId);
      setIsCustomActive(true);
      
      // Find and apply the theme
      if (saved) {
        try {
          const themes: SavedTheme[] = JSON.parse(saved);
          const activeTheme = themes.find(t => t.id === activeId);
          if (activeTheme) {
            setLightColors(activeTheme.lightColors);
            setDarkColors(activeTheme.darkColors);
            applyCustomTheme(activeTheme.lightColors, activeTheme.darkColors);
          }
        } catch {
          // Use defaults
        }
      }
    }

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      if (isCustomActive && activeThemeId) {
        const saved = localStorage.getItem('saved-custom-themes');
        if (saved) {
          try {
            const themes: SavedTheme[] = JSON.parse(saved);
            const activeTheme = themes.find(t => t.id === activeThemeId);
            if (activeTheme) {
              applyCustomTheme(activeTheme.lightColors, activeTheme.darkColors);
            }
          } catch {
            // Ignore
          }
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const applyCustomTheme = (light: CustomColors, dark: CustomColors) => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    const colors = isDark ? dark : light;
    
    // Apply primary
    const primaryHSL = hexToHSL(colors.primary);
    root.style.setProperty('--primary', primaryHSL);
    root.style.setProperty('--ring', primaryHSL);
    root.style.setProperty('--sidebar-primary', primaryHSL);
    root.style.setProperty('--glow-color', primaryHSL);
    
    // Apply secondary as accent-foreground
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

    // Calculate chart colors from primary
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

    document.documentElement.classList.add('theme-transitioning');
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 500);
  };

  const handleLightColorChange = (key: keyof CustomColors, value: string) => {
    setLightColors(prev => ({ ...prev, [key]: value }));
  };

  const handleDarkColorChange = (key: keyof CustomColors, value: string) => {
    setDarkColors(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyTheme = () => {
    applyCustomTheme(lightColors, darkColors);
    localStorage.setItem('custom-theme-active', 'true');
    localStorage.removeItem('color-theme');
    setIsCustomActive(true);
    toast({ title: 'Custom theme applied!' });
  };

  const handleSaveTheme = () => {
    if (!newThemeName.trim()) {
      toast({ title: 'Please enter a theme name', variant: 'destructive' });
      return;
    }

    const newTheme: SavedTheme = {
      id: Date.now().toString(),
      name: newThemeName.trim(),
      lightColors,
      darkColors,
      createdAt: Date.now(),
    };

    const updated = [...savedThemes, newTheme];
    setSavedThemes(updated);
    localStorage.setItem('saved-custom-themes', JSON.stringify(updated));
    setNewThemeName('');
    toast({ title: `Theme "${newTheme.name}" saved!` });
  };

  const handleLoadTheme = (theme: SavedTheme) => {
    setLightColors(theme.lightColors);
    setDarkColors(theme.darkColors);
    applyCustomTheme(theme.lightColors, theme.darkColors);
    setActiveThemeId(theme.id);
    setIsCustomActive(true);
    localStorage.setItem('custom-theme-active', 'true');
    localStorage.setItem('active-custom-theme-id', theme.id);
    localStorage.removeItem('color-theme');
    toast({ title: `Theme "${theme.name}" applied!` });
  };

  const handleDeleteTheme = (themeId: string) => {
    const updated = savedThemes.filter(t => t.id !== themeId);
    setSavedThemes(updated);
    localStorage.setItem('saved-custom-themes', JSON.stringify(updated));
    
    if (activeThemeId === themeId) {
      setActiveThemeId(null);
      localStorage.removeItem('active-custom-theme-id');
    }
    
    toast({ title: 'Theme deleted' });
  };

  const handleResetTheme = () => {
    setLightColors(defaultLightColors);
    setDarkColors(defaultDarkColors);
    localStorage.removeItem('custom-theme-active');
    localStorage.removeItem('active-custom-theme-id');
    setIsCustomActive(false);
    setActiveThemeId(null);
    
    // Reset all CSS variables
    const root = document.documentElement;
    const cssVars = [
      '--primary', '--ring', '--sidebar-primary', '--glow-color',
      '--accent-foreground', '--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5',
      '--badge-shine', '--background', '--card', '--popover', '--muted', '--secondary',
      '--foreground', '--card-foreground', '--popover-foreground', '--border', '--input',
      '--sidebar-background', '--sidebar-border', '--muted-foreground'
    ];
    cssVars.forEach(v => root.style.removeProperty(v));
    
    toast({ title: 'Theme reset to default' });
  };

  const colorFields: { key: keyof CustomColors; label: string; description: string }[] = [
    { key: 'primary', label: 'Primary', description: 'Buttons, links' },
    { key: 'secondary', label: 'Secondary', description: 'Charts, accents' },
    { key: 'accent', label: 'Accent', description: 'Highlights' },
    { key: 'background', label: 'Background', description: 'Page bg' },
    { key: 'card', label: 'Card', description: 'Card bg' },
    { key: 'muted', label: 'Muted', description: 'Subtle areas' },
    { key: 'foreground', label: 'Text', description: 'Text color' },
  ];

  const renderColorInputs = (
    colors: CustomColors, 
    onChange: (key: keyof CustomColors, value: string) => void,
    mode: 'light' | 'dark'
  ) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {colorFields.map(({ key, label, description }) => (
        <div key={key} className="space-y-1">
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
            onChange={(e) => onChange(key, e.target.value)}
            className="h-9 p-1 cursor-pointer"
          />
          <p className="text-[10px] text-muted-foreground">{description}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4 p-4 rounded-lg border border-dashed border-primary/30 bg-muted/20">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Create your own personalized theme</p>
        {isCustomActive && (
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Active</span>
        )}
      </div>
        {/* Color Preview */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sun className="w-3 h-3" /> Light Mode
          </div>
          <div className="flex gap-0.5 h-6 rounded-md overflow-hidden border border-border">
            {Object.values(lightColors).map((color, i) => (
              <div key={i} className="flex-1" style={{ backgroundColor: color }} />
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Moon className="w-3 h-3" /> Dark Mode
          </div>
          <div className="flex gap-0.5 h-6 rounded-md overflow-hidden border border-border">
            {Object.values(darkColors).map((color, i) => (
              <div key={i} className="flex-1" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>

        {/* Tabs for Light/Dark */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'light' | 'dark')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="light" className="flex items-center gap-2">
              <Sun className="w-4 h-4" /> Light Mode
            </TabsTrigger>
            <TabsTrigger value="dark" className="flex items-center gap-2">
              <Moon className="w-4 h-4" /> Dark Mode
            </TabsTrigger>
          </TabsList>
          <TabsContent value="light" className="mt-4">
            {renderColorInputs(lightColors, handleLightColorChange, 'light')}
          </TabsContent>
          <TabsContent value="dark" className="mt-4">
            {renderColorInputs(darkColors, handleDarkColorChange, 'dark')}
          </TabsContent>
        </Tabs>

        {/* Apply & Reset Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleApplyTheme} className="flex-1">
            <Sparkles className="w-4 h-4 mr-2" />
            Apply Theme
          </Button>
          <Button variant="outline" onClick={handleResetTheme}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Save Theme Section */}
        <div className="pt-4 border-t border-border space-y-3">
          <Label className="text-sm font-medium">Save Current Theme</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter theme name..."
              value={newThemeName}
              onChange={(e) => setNewThemeName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveTheme()}
            />
            <Button onClick={handleSaveTheme} size="icon">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Saved Themes */}
        {savedThemes.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">My Saved Themes</Label>
            <ScrollArea className="h-40">
              <div className="space-y-2 pr-3">
                {savedThemes.map((theme) => (
                  <div 
                    key={theme.id} 
                    className={`flex items-center justify-between p-2 rounded-lg border ${
                      activeThemeId === theme.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Theme preview mini */}
                      <div className="flex gap-0.5 w-16 h-4 rounded overflow-hidden">
                        <div className="flex-1" style={{ backgroundColor: theme.lightColors.primary }} />
                        <div className="flex-1" style={{ backgroundColor: theme.lightColors.secondary }} />
                        <div className="flex-1" style={{ backgroundColor: theme.darkColors.primary }} />
                        <div className="flex-1" style={{ backgroundColor: theme.darkColors.secondary }} />
                      </div>
                      <span className="text-sm font-medium">{theme.name}</span>
                      {activeThemeId === theme.id && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleLoadTheme(theme)}
                      >
                        Apply
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteTheme(theme.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
    </div>
  );
}
