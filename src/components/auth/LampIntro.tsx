import { useState, useEffect } from 'react';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface LampIntroProps {
  onComplete: () => void;
}

export function LampIntro({ onComplete }: LampIntroProps) {
  const [isLightOn, setIsLightOn] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [showHint, setShowHint] = useState(true);
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
      
      setTimeout(() => {
        onComplete();
      }, 1200);
    }, 300);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-1000 ${
        isLightOn ? 'bg-background' : 'bg-[hsl(0,0%,2%)]'
      }`}
      style={{
        opacity: isLightOn ? 0 : 1,
        pointerEvents: isLightOn ? 'none' : 'auto',
        transitionDelay: isLightOn ? '0.8s' : '0s'
      }}
    >
      {/* Ceiling mount */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-8 bg-[hsl(0,0%,15%)] rounded-b-sm" />
      
      {/* Lamp cord */}
      <div 
        className={`absolute top-8 left-1/2 -translate-x-1/2 w-0.5 bg-[hsl(0,0%,25%)] transition-all duration-300 ${
          isPulling ? 'h-44' : 'h-40'
        }`}
      />
      
      {/* Lamp shade */}
      <div className="absolute top-48 left-1/2 -translate-x-1/2 flex flex-col items-center">
        {/* Shade top */}
        <div 
          className={`w-24 h-3 rounded-t-full transition-all duration-500 ${
            isLightOn 
              ? 'bg-primary shadow-[0_0_60px_30px_hsl(var(--primary)/0.4)]' 
              : 'bg-[hsl(0,0%,20%)]'
          }`}
        />
        {/* Shade body */}
        <div 
          className={`w-32 h-16 rounded-b-xl transition-all duration-500 ${
            isLightOn 
              ? 'bg-gradient-to-b from-primary to-[hsl(var(--chart-2))] shadow-[0_20px_80px_40px_hsl(var(--primary)/0.3)]' 
              : 'bg-gradient-to-b from-[hsl(0,0%,20%)] to-[hsl(0,0%,15%)]'
          }`}
          style={{
            clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)'
          }}
        />
        
        {/* Light glow effect */}
        {isLightOn && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary/20 blur-3xl animate-pulse" />
        )}
      </div>
      
      {/* Pull cord with ball */}
      <div 
        className={`absolute left-1/2 -translate-x-1/2 cursor-pointer group transition-all duration-300 ${
          isPulling ? 'top-[340px]' : 'top-[300px]'
        }`}
        onClick={handlePull}
      >
        {/* Cord */}
        <div className="w-0.5 h-16 bg-[hsl(0,0%,35%)] mx-auto group-hover:bg-[hsl(0,0%,50%)] transition-colors" />
        {/* Pull ball */}
        <div 
          className={`w-5 h-5 rounded-full mx-auto transition-all duration-200 ${
            isLightOn 
              ? 'bg-primary shadow-[0_0_20px_hsl(var(--primary)/0.6)]' 
              : 'bg-[hsl(0,0%,40%)] group-hover:bg-[hsl(0,0%,60%)] group-hover:scale-110'
          }`}
        />
      </div>
      
      {/* Pull hint */}
      {showHint && !isLightOn && (
        <div className="absolute top-[420px] left-1/2 -translate-x-1/2 animate-bounce">
          <p className="text-[hsl(0,0%,40%)] text-sm font-medium tracking-wide">
            Pull to turn on
          </p>
          <div className="flex justify-center mt-2">
            <svg 
              className="w-6 h-6 text-[hsl(0,0%,40%)]" 
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
          </div>
        </div>
      )}
      
      {/* Floor reflection when light is on */}
      {isLightOn && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-primary/10 to-transparent"
        />
      )}
    </div>
  );
}
