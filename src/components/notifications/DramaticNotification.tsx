import { useState, useEffect, useCallback } from 'react';
import { X, Bell, Zap, Flame, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DramaticNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  reminder: {
    content: string;
    priority: number;
  } | null;
}

export function DramaticNotification({ isOpen, onClose, reminder }: DramaticNotificationProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showShockwave, setShowShockwave] = useState(false);

  // Play dramatic sound effect
  const playDramaticSound = useCallback(() => {
    try {
      const audioContext = new AudioContext();
      const priority = reminder?.priority || 1;
      
      // Create dramatic ascending notes
      const notes = priority >= 3 
        ? [440, 554.37, 659.25, 880] // A4, C#5, E5, A5 (urgent)
        : priority === 2
          ? [392, 493.88, 587.33] // G4, B4, D5 (moderate)
          : [261.63, 329.63, 392]; // C4, E4, G4 (gentle)
      
      notes.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = priority >= 3 ? 'sawtooth' : 'sine';
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        
        const startTime = audioContext.currentTime + index * 0.15;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.4);
      });
    } catch (e) {
      console.log('Audio not available');
    }
  }, [reminder?.priority]);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setShowShockwave(true);
      playDramaticSound();
      
      setTimeout(() => setShowShockwave(false), 1000);
      
      // Request browser notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      // Show browser notification too
      if ('Notification' in window && Notification.permission === 'granted' && reminder) {
        new Notification('⚡ Reminder Alert!', {
          body: reminder.content,
          icon: '/favicon.ico',
          tag: 'reminder-notification',
        });
      }
    }
  }, [isOpen, playDramaticSound, reminder]);

  if (!isOpen || !reminder) return null;

  const getPriorityConfig = (priority: number) => {
    if (priority >= 3) return {
      icon: AlertTriangle,
      label: 'URGENT',
      bgClass: 'from-destructive/90 via-destructive to-destructive/90',
      ringClass: 'ring-destructive',
      glowColor: 'hsl(var(--destructive))',
    };
    if (priority === 2) return {
      icon: Flame,
      label: 'IMPORTANT',
      bgClass: 'from-chart-4/90 via-chart-2 to-chart-4/90',
      ringClass: 'ring-chart-2',
      glowColor: 'hsl(var(--chart-2))',
    };
    return {
      icon: Bell,
      label: 'REMINDER',
      bgClass: 'from-primary/90 via-primary to-primary/90',
      ringClass: 'ring-primary',
      glowColor: 'hsl(var(--primary))',
    };
  };

  const config = getPriorityConfig(reminder.priority);
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Dramatic backdrop with pulsing effect */}
      <div 
        className={cn(
          "absolute inset-0 bg-background/80 backdrop-blur-md transition-opacity duration-500",
          isAnimating ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      
      {/* Shockwave effect */}
      {showShockwave && (
        <>
          <div 
            className="absolute w-32 h-32 rounded-full animate-ping"
            style={{ 
              background: `radial-gradient(circle, ${config.glowColor} 0%, transparent 70%)`,
              animationDuration: '0.8s',
            }}
          />
          <div 
            className="absolute w-64 h-64 rounded-full"
            style={{ 
              background: `radial-gradient(circle, ${config.glowColor} 0%, transparent 70%)`,
              animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) forwards',
              opacity: 0.5,
            }}
          />
        </>
      )}
      
      {/* Main notification card */}
      <div 
        className={cn(
          "relative z-10 w-[90%] max-w-md p-6 rounded-2xl shadow-2xl",
          "bg-gradient-to-br",
          config.bgClass,
          "ring-4 ring-offset-2 ring-offset-background",
          config.ringClass,
          "transform transition-all duration-500",
          isAnimating ? "scale-100 opacity-100" : "scale-75 opacity-0"
        )}
        style={{
          boxShadow: `0 0 60px ${config.glowColor}, 0 0 100px ${config.glowColor}`,
        }}
      >
        {/* Animated lightning bolts */}
        <div className="absolute -top-4 -left-4 animate-bounce">
          <Zap className="w-10 h-10 text-accent-foreground drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 10px currentColor)' }} />
        </div>
        <div className="absolute -top-4 -right-4 animate-bounce" style={{ animationDelay: '0.2s' }}>
          <Zap className="w-10 h-10 text-accent-foreground drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 10px currentColor)' }} />
        </div>
        
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>
        
        {/* Content */}
        <div className="text-center space-y-4">
          {/* Animated icon */}
          <div className="relative mx-auto w-20 h-20">
            <div 
              className="absolute inset-0 rounded-full animate-ping opacity-50"
              style={{ background: 'rgba(255,255,255,0.3)' }}
            />
            <div className="relative w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center backdrop-blur-sm">
              <Icon className="w-10 h-10 text-primary-foreground animate-pulse" />
            </div>
          </div>
          
          {/* Priority label */}
          <div className="inline-block px-4 py-1 rounded-full bg-primary-foreground/20 backdrop-blur-sm">
            <span className="text-xs font-bold tracking-widest text-primary-foreground">
              ⚡ {config.label} ⚡
            </span>
          </div>
          
          {/* Reminder content */}
          <h2 className="text-2xl font-bold text-primary-foreground leading-tight">
            {reminder.content}
          </h2>
          
          {/* Action button */}
          <Button
            onClick={onClose}
            className="w-full mt-4 bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold text-lg py-6"
          >
            Got it!
          </Button>
        </div>
        
        {/* Decorative particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary-foreground/40"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${2 + Math.random() * 2}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
