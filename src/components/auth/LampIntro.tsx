import { useState, useEffect } from 'react';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface LampIntroProps {
  onComplete: () => void;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

export function LampIntro({ onComplete }: LampIntroProps) {
  const [isLightOn, setIsLightOn] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [isWiggling, setIsWiggling] = useState(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [isBlinking, setIsBlinking] = useState(false);
  const { playClick } = useSoundEffects();

  // Blinking animation before light is on
  useEffect(() => {
    if (isLightOn) return;
    
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 2500);

    return () => clearInterval(blinkInterval);
  }, [isLightOn]);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Generate sparkles when light turns on
  useEffect(() => {
    if (isLightOn) {
      const newSparkles: Sparkle[] = [];
      for (let i = 0; i < 20; i++) {
        newSparkles.push({
          id: i,
          x: Math.random() * 300 - 150,
          y: Math.random() * 200 - 100,
          size: Math.random() * 8 + 4,
          delay: Math.random() * 0.5,
        });
      }
      setSparkles(newSparkles);
    }
  }, [isLightOn]);

  const handlePull = () => {
    if (isLightOn) return;
    
    setIsPulling(true);
    setShowHint(false);
    playClick();
    
    setTimeout(() => {
      setIsPulling(false);
      setIsLightOn(true);
      setIsWiggling(true);
      
      setTimeout(() => {
        setIsWiggling(false);
      }, 800);
      
      setTimeout(() => {
        onComplete();
      }, 1800);
    }, 300);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-1000 ${
        isLightOn ? 'bg-background' : 'bg-primary/10'
      }`}
      style={{
        opacity: isLightOn ? 0 : 1,
        pointerEvents: isLightOn ? 'none' : 'auto',
        transitionDelay: isLightOn ? '1s' : '0s'
      }}
    >
      {/* Floor Lamp Container */}
      <div 
        className="relative flex flex-col items-center"
        style={{
          animation: isWiggling ? 'wiggle 0.15s ease-in-out 5' : 'none',
        }}
      >
        {/* Sparkles */}
        {isLightOn && sparkles.map((sparkle) => (
          <div
            key={sparkle.id}
            className="absolute pointer-events-none"
            style={{
              left: `calc(50% + ${sparkle.x}px)`,
              top: `${sparkle.y - 50}px`,
              width: sparkle.size,
              height: sparkle.size,
              animation: `sparkle 1s ease-out ${sparkle.delay}s forwards`,
              opacity: 0,
            }}
          >
            <svg viewBox="0 0 24 24" fill="hsl(var(--accent))" className="w-full h-full">
              <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" />
            </svg>
          </div>
        ))}
        
        {/* Light glow effect */}
        {isLightOn && (
          <>
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-accent/40 blur-3xl animate-pulse" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-accent/60 blur-2xl" />
          </>
        )}
        
        {/* Lamp Shade */}
        <div className="relative">
          {/* Shade top rim */}
          <div 
            className={`w-20 h-2 rounded-t-full mx-auto transition-all duration-500 ${
              isLightOn 
                ? 'bg-accent shadow-[0_0_60px_30px_hsl(var(--accent)/0.6)]' 
                : 'bg-muted'
            }`}
          />
          {/* Shade body - elegant trapezoid */}
          <div 
            className={`w-32 h-28 mx-auto transition-all duration-500 relative ${
              isLightOn 
                ? 'bg-gradient-to-b from-accent/90 to-accent/60' 
                : 'bg-gradient-to-b from-muted to-muted-foreground/20'
            }`}
            style={{
              clipPath: 'polygon(8% 0%, 92% 0%, 100% 100%, 0% 100%)',
              borderRadius: '0 0 4px 4px'
            }}
          >
            {/* Inner light glow */}
            {isLightOn && (
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent" />
            )}
          </div>
          
          {/* Lamp Face - Smiley */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
            {/* Eyes */}
            <div className="flex gap-8 mb-3">
              <div 
                className={`rounded-full transition-all duration-300 ${
                  isLightOn 
                    ? 'w-4 h-4 bg-primary-foreground' 
                    : 'bg-foreground/60'
                } ${isBlinking && !isLightOn ? 'h-0.5 w-4' : isLightOn ? 'w-4 h-4' : 'w-4 h-4'}`}
                style={{ 
                  animation: isLightOn ? 'happyEyes 0.5s ease-in-out 3' : 'none',
                }}
              />
              <div 
                className={`rounded-full transition-all duration-300 ${
                  isLightOn 
                    ? 'w-4 h-4 bg-primary-foreground' 
                    : 'bg-foreground/60'
                } ${isBlinking && !isLightOn ? 'h-0.5 w-4' : isLightOn ? 'w-4 h-4' : 'w-4 h-4'}`}
                style={{ 
                  animation: isLightOn ? 'happyEyes 0.5s ease-in-out 3' : 'none',
                  animationDelay: '0.1s',
                }}
              />
            </div>
            {/* Mouth */}
            <div 
              className={`transition-all duration-500 ${
                isLightOn 
                  ? 'w-10 h-5 border-b-4 border-primary-foreground rounded-b-full' 
                  : 'w-6 h-0.5 bg-foreground/40 rounded-full'
              }`}
            />
          </div>
        </div>
        
        {/* Lamp neck - decorative middle piece */}
        <div 
          className={`w-3 h-4 mx-auto transition-all duration-500 ${
            isLightOn ? 'bg-primary' : 'bg-muted-foreground/40'
          }`}
        />
        
        {/* Decorative knob */}
        <div 
          className={`w-6 h-3 mx-auto rounded-full transition-all duration-500 ${
            isLightOn ? 'bg-primary' : 'bg-muted-foreground/50'
          }`}
        />
        
        {/* Tall elegant stand */}
        <div 
          className={`w-2 mx-auto transition-all duration-500 ${
            isLightOn ? 'bg-gradient-to-b from-primary to-primary/80' : 'bg-gradient-to-b from-muted-foreground/50 to-muted-foreground/30'
          }`}
          style={{ height: '180px' }}
        />
        
        {/* Stand decorative middle */}
        <div 
          className={`w-4 h-4 mx-auto rounded-full transition-all duration-500 ${
            isLightOn ? 'bg-primary' : 'bg-muted-foreground/40'
          }`}
        />
        
        {/* Lower stand */}
        <div 
          className={`w-2 mx-auto transition-all duration-500 ${
            isLightOn ? 'bg-gradient-to-b from-primary/80 to-primary/60' : 'bg-gradient-to-b from-muted-foreground/40 to-muted-foreground/30'
          }`}
          style={{ height: '60px' }}
        />
        
        {/* Base */}
        <div className="flex flex-col items-center">
          <div 
            className={`w-6 h-2 rounded-sm transition-all duration-500 ${
              isLightOn ? 'bg-primary' : 'bg-muted-foreground/50'
            }`}
          />
          <div 
            className={`w-16 h-3 rounded-full transition-all duration-500 ${
              isLightOn 
                ? 'bg-gradient-to-r from-primary via-primary/90 to-primary shadow-lg' 
                : 'bg-gradient-to-r from-muted-foreground/40 via-muted-foreground/50 to-muted-foreground/40'
            }`}
          />
        </div>
        
        {/* Pull cord with swinging animation */}
        <div 
          className="absolute -right-16 top-20 cursor-pointer group"
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
              isPulling ? 'h-24' : 'h-16'
            } ${isLightOn ? 'bg-primary/60' : 'bg-muted-foreground/50 group-hover:bg-muted-foreground/80'}`}
          />
          {/* Pull ball/tassel */}
          <div 
            className={`w-5 h-7 mx-auto rounded-b-full transition-all duration-200 ${
              isLightOn 
                ? 'bg-primary shadow-[0_0_20px_hsl(var(--primary)/0.6)]' 
                : 'bg-muted-foreground/60 group-hover:bg-accent group-hover:scale-110'
            }`}
          />
        </div>
      </div>
      
      {/* Pull hint */}
      {showHint && !isLightOn && (
        <div className="absolute top-1/3 right-1/4 animate-bounce">
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
      
      {/* Floor glow when light is on */}
      {isLightOn && (
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-accent/30 to-transparent" />
      )}
      
      {/* Animations */}
      <style>{`
        @keyframes swing {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(8deg); }
        }
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        
        @keyframes sparkle {
          0% { 
            opacity: 0; 
            transform: scale(0) rotate(0deg); 
          }
          50% { 
            opacity: 1; 
            transform: scale(1) rotate(180deg); 
          }
          100% { 
            opacity: 0; 
            transform: scale(0.5) rotate(360deg) translateY(-20px); 
          }
        }
        
        @keyframes happyEyes {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.2); }
        }
      `}</style>
    </div>
  );
}
