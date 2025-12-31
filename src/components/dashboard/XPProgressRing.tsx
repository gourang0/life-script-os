import { cn } from '@/lib/utils';

interface XPProgressRingProps {
  level: number;
  currentXP: number;
  xpForNextLevel: number;
  size?: 'sm' | 'md' | 'lg';
}

export function XPProgressRing({ level, currentXP, xpForNextLevel, size = 'md' }: XPProgressRingProps) {
  const progress = (currentXP / xpForNextLevel) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-40 h-40'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className={cn("relative", sizeClasses[size])}>
      <svg className="w-full h-full transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          fill="none"
          strokeWidth="8"
          className="stroke-muted"
        />
        {/* Progress circle */}
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className="stroke-primary transition-all duration-500"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-bold text-foreground", textSizes[size])}>
          {level}
        </span>
        <span className="text-xs text-muted-foreground">LEVEL</span>
      </div>
    </div>
  );
}
