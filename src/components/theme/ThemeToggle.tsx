import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    // Add transition class for smooth animation
    document.documentElement.classList.add('theme-transitioning');
    
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    // Remove transition class after animation completes
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 500);
  };

  const isDark = theme === 'dark' || 
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <Button 
      variant="ghost" 
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "relative w-10 h-10 rounded-full overflow-hidden",
        "bg-gradient-to-br from-primary/10 to-accent/10",
        "hover:from-primary/20 hover:to-accent/20",
        "transition-all duration-300"
      )}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Sun icon */}
        <Sun 
          className={cn(
            "absolute h-5 w-5 transition-all duration-500",
            isDark 
              ? "rotate-90 scale-0 opacity-0" 
              : "rotate-0 scale-100 opacity-100 text-yellow-500"
          )} 
        />
        
        {/* Moon icon */}
        <Moon 
          className={cn(
            "absolute h-5 w-5 transition-all duration-500",
            isDark 
              ? "rotate-0 scale-100 opacity-100 text-blue-300" 
              : "-rotate-90 scale-0 opacity-0"
          )} 
        />
      </div>
      
      {/* Glow effect */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full transition-all duration-500",
          isDark 
            ? "bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
            : "bg-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
        )} 
      />
      
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}