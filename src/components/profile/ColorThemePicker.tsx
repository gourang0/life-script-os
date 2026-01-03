import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const colorThemes = [
  { name: 'Orange', hue: '20', primary: '20 90% 48%' },
  { name: 'Blue', hue: '220', primary: '220 90% 48%' },
  { name: 'Green', hue: '142', primary: '142 76% 36%' },
  { name: 'Purple', hue: '271', primary: '271 76% 53%' },
  { name: 'Red', hue: '0', primary: '0 72% 50%' },
  { name: 'Pink', hue: '330', primary: '330 80% 50%' },
  { name: 'Teal', hue: '180', primary: '180 70% 40%' },
  { name: 'Yellow', hue: '45', primary: '45 93% 47%' },
  { name: 'Indigo', hue: '239', primary: '239 84% 67%' },
  { name: 'Cyan', hue: '190', primary: '190 95% 39%' },
  { name: 'Lime', hue: '84', primary: '84 85% 35%' },
  { name: 'Rose', hue: '350', primary: '350 89% 60%' },
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
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--ring', theme.primary);
    root.style.setProperty('--sidebar-primary', theme.primary);
    root.style.setProperty('--sidebar-ring', theme.primary);
  };

  const handleSelectTheme = (theme: typeof colorThemes[0]) => {
    setSelectedTheme(theme.name);
    applyTheme(theme);
    localStorage.setItem('color-theme', theme.name);
    toast({ title: `Theme changed to ${theme.name}` });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Color Theme
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {colorThemes.map((theme) => (
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
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Selected: {selectedTheme}
        </p>
      </CardContent>
    </Card>
  );
}
