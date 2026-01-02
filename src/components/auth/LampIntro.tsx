import { useState, useEffect } from 'react';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface LampIntroProps {
  onComplete: () => void;
}

export function LampIntro({ onComplete }: LampIntroProps) {
  const [isLightOn, setIsLightOn] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [isHappy, setIsHappy] = useState(false);
  const { playClick } = useSoundEffects();

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handlePull = () => {
    if (isLightOn) return;
    
    setIsPulling(true);
    setShowHint(false);
    playClick();
    
    setTimeout(() => {
      setIsPulling(false);
      setIsLightOn(true);
      setIsHappy(true);
      
      setTimeout(() => {
        onComplete();
      }, 1500);
    }, 300);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-end pb-32 transition-all duration-1000 ${
        isLightOn ? 'bg-background' : 'bg-primary/10'
      }`}
      style={{
        opacity: isLightOn ? 0 : 1,
        pointerEvents: isLightOn ? 'none' : 'auto',
        transitionDelay: isLightOn ? '0.8s' : '0s'
      }}
    >
      {/* Table surface */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-80 h-4 bg-primary/20 rounded-full blur-sm" />
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-96 h-6 bg-gradient-to-t from-primary/30 to-transparent rounded-t-full" />
      
      {/* Table Lamp Container */}
      <div className="relative flex flex-col items-center">
        
        {/* Light glow effect */}
        {isLightOn && (
          <>
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-accent/30 blur-3xl animate-pulse" />
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-accent/50 blur-2xl" />
          </>
        )}
        
        {/* Lamp Shade */}
        <div className="relative">
          {/* Shade top rim */}
          <div 
            className={`w-28 h-2 rounded-t-full mx-auto transition-all duration-500 ${
              isLightOn 
                ? 'bg-accent shadow-[0_0_40px_20px_hsl(var(--accent)/0.5)]' 
                : 'bg-muted'
            }`}
          />
          {/* Shade body - trapezoid shape */}
          <div 
            className={`w-36 h-20 mx-auto transition-all duration-500 relative ${
              isLightOn 
                ? 'bg-gradient-to-b from-accent to-accent/70' 
                : 'bg-gradient-to-b from-muted to-muted-foreground/30'
            }`}
            style={{
              clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)',
              borderRadius: '0 0 8px 8px'
            }}
          >
            {/* Inner light */}
            {isLightOn && (
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-b-lg" />
            )}
          </div>
          
          {/* Lamp Face - Smiley */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
            {/* Eyes */}
            <div className="flex gap-6 mb-2">
              <div 
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  isLightOn 
                    ? 'bg-primary-foreground scale-110' 
                    : 'bg-foreground/60'
                } ${isHappy ? 'animate-bounce' : ''}`}
                style={{ animationDelay: '0s' }}
              />
              <div 
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  isLightOn 
                    ? 'bg-primary-foreground scale-110' 
                    : 'bg-foreground/60'
                } ${isHappy ? 'animate-bounce' : ''}`}
                style={{ animationDelay: '0.1s' }}
              />
            </div>
            {/* Mouth */}
            <div 
              className={`transition-all duration-500 ${
                isLightOn 
                  ? 'w-8 h-4 border-b-4 border-primary-foreground rounded-b-full' 
                  : 'w-6 h-0.5 bg-foreground/40 rounded-full'
              }`}
            />
          </div>
        </div>
        
        {/* Lamp neck */}
        <div 
          className={`w-4 h-8 mx-auto transition-all duration-500 ${
            isLightOn ? 'bg-primary' : 'bg-muted-foreground/50'
          }`}
        />
        
        {/* Lamp base */}
        <div className="flex flex-col items-center">
          <div 
            className={`w-8 h-3 rounded-sm transition-all duration-500 ${
              isLightOn ? 'bg-primary' : 'bg-muted-foreground/50'
            }`}
          />
          <div 
            className={`w-20 h-4 rounded-full transition-all duration-500 ${
              isLightOn 
                ? 'bg-gradient-to-r from-primary via-primary/80 to-primary shadow-lg' 
                : 'bg-gradient-to-r from-muted-foreground/40 via-muted-foreground/50 to-muted-foreground/40'
            }`}
          />
        </div>
        
        {/* Pull cord with swinging animation */}
        <div 
          className={`absolute -right-12 top-16 cursor-pointer group transition-all duration-300`}
          onClick={handlePull}
          style={{
            transformOrigin: 'top center',
            animation: !isLightOn && !isPulling ? 'swing 2s ease-in-out infinite' : 'none'
          }}
        >
          {/* Cord attachment point */}
          <div className="w-2 h-2 bg-muted-foreground/60 rounded-full mx-auto" />
          {/* Cord */}
          <div 
            className={`w-0.5 mx-auto transition-all duration-300 ${
              isPulling ? 'h-20' : 'h-14'
            } ${isLightOn ? 'bg-primary/60' : 'bg-muted-foreground/50 group-hover:bg-muted-foreground/80'}`}
          />
          {/* Pull ball/tassel */}
          <div 
            className={`w-4 h-6 mx-auto rounded-b-full transition-all duration-200 ${
              isLightOn 
                ? 'bg-primary shadow-[0_0_15px_hsl(var(--primary)/0.6)]' 
                : 'bg-muted-foreground/60 group-hover:bg-accent group-hover:scale-110'
            }`}
          />
        </div>
      </div>
      
      {/* Pull hint */}
      {showHint && !isLightOn && (
        <div className="absolute bottom-48 right-1/4 animate-bounce">
          <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border">
            <svg 
              className="w-5 h-5 text-primary animate-pulse" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 14l-7 7m0 0l-7-7m7 7V3" 
              />
            </svg>
            <p className="text-foreground/80 text-sm font-medium tracking-wide">
              Pull me!
            </p>
          </div>
        </div>
      )}
      
      {/* Floor reflection when light is on */}
      {isLightOn && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-accent/20 to-transparent"
        />
      )}
      
      {/* CSS for swing animation */}
      <style>{`
        @keyframes swing {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
      `}</style>
    </div>
  );
}
