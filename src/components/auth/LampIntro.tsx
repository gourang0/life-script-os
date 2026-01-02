import { useState, useEffect } from 'react';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Confetti } from '@/components/ui/confetti';

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
  const [showConfetti, setShowConfetti] = useState(false);
  const [isGrabbing, setIsGrabbing] = useState(false);
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
      setShowConfetti(true);
    }
  }, [isLightOn]);

  const handleMouseDown = () => {
    if (isLightOn) return;
    setIsGrabbing(true);
  };

  const handleMouseUp = () => {
    if (isLightOn || !isGrabbing) return;
    
    setIsGrabbing(false);
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
      }, 2000);
    }, 400);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-1000 overflow-hidden ${
        isLightOn ? 'bg-background' : 'bg-primary/5'
      }`}
      style={{
        opacity: isLightOn ? 0 : 1,
        pointerEvents: isLightOn ? 'none' : 'auto',
        transitionDelay: isLightOn ? '1.2s' : '0s'
      }}
    >
      {/* Confetti explosion */}
      <Confetti isActive={showConfetti} pieceCount={150} duration={3000} />
      
      {/* Floor Lamp Container with floating animation */}
      <div 
        className="relative flex flex-col items-center"
        style={{
          animation: isWiggling 
            ? 'wiggle 0.15s ease-in-out 5' 
            : !isLightOn 
              ? 'float 3s ease-in-out infinite' 
              : 'none',
        }}
      >
        {/* Pulsing glow effect when lamp is OFF */}
        {!isLightOn && (
          <div 
            className="absolute -top-8 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-primary/20 blur-3xl"
            style={{
              animation: 'pulseGlow 2s ease-in-out infinite',
            }}
          />
        )}
        
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
        
        {/* Light glow effect - only when ON */}
        {isLightOn && (
          <>
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-accent/40 blur-3xl animate-pulse" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-accent/60 blur-2xl" />
          </>
        )}
        
        {/* Lamp Shade */}
        <div className="relative z-10">
          {/* Shade top rim */}
          <div 
            className={`w-24 h-3 rounded-t-full mx-auto transition-all duration-500 border-t-2 border-x-2 ${
              isLightOn 
                ? 'bg-accent border-accent/80 shadow-[0_0_60px_30px_hsl(var(--accent)/0.6)]' 
                : 'bg-muted-foreground/30 border-muted-foreground/40'
            }`}
          />
          {/* Shade body - elegant trapezoid */}
          <div 
            className={`w-40 h-32 mx-auto transition-all duration-500 relative border-x-2 border-b-2 ${
              isLightOn 
                ? 'bg-gradient-to-b from-accent/90 to-accent/60 border-accent/50' 
                : 'bg-gradient-to-b from-muted-foreground/25 to-muted-foreground/15 border-muted-foreground/30'
            }`}
            style={{
              clipPath: 'polygon(6% 0%, 94% 0%, 100% 100%, 0% 100%)',
              borderRadius: '0 0 6px 6px'
            }}
          >
            {/* Inner light glow */}
            {isLightOn && (
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent" />
            )}
            
            {/* Fabric texture lines */}
            <div className="absolute inset-0 opacity-20">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i} 
                  className={`absolute h-full w-px ${isLightOn ? 'bg-white/30' : 'bg-foreground/20'}`}
                  style={{ left: `${12 + i * 11}%` }}
                />
              ))}
            </div>
          </div>
          
          {/* Lamp Face - Smiley */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
            {/* Eyes */}
            <div className="flex gap-10 mb-3">
              <div 
                className={`rounded-full transition-all duration-300 ${
                  isLightOn 
                    ? 'w-5 h-5 bg-primary-foreground shadow-lg' 
                    : 'bg-foreground/70'
                } ${isBlinking && !isLightOn ? 'h-1 w-5' : isLightOn ? 'w-5 h-5' : 'w-5 h-5'}`}
                style={{ 
                  animation: isLightOn ? 'happyEyes 0.5s ease-in-out 3' : 'none',
                }}
              />
              <div 
                className={`rounded-full transition-all duration-300 ${
                  isLightOn 
                    ? 'w-5 h-5 bg-primary-foreground shadow-lg' 
                    : 'bg-foreground/70'
                } ${isBlinking && !isLightOn ? 'h-1 w-5' : isLightOn ? 'w-5 h-5' : 'w-5 h-5'}`}
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
                  ? 'w-12 h-6 border-b-4 border-primary-foreground rounded-b-full' 
                  : 'w-8 h-1 bg-foreground/50 rounded-full'
              }`}
            />
          </div>
        </div>
        
        {/* Lamp neck - decorative connector */}
        <div 
          className={`w-4 h-5 mx-auto transition-all duration-500 z-10 ${
            isLightOn ? 'bg-primary' : 'bg-muted-foreground/50'
          }`}
        />
        
        {/* Decorative knob */}
        <div 
          className={`w-8 h-4 mx-auto rounded-full transition-all duration-500 z-10 shadow-md ${
            isLightOn ? 'bg-primary' : 'bg-muted-foreground/60'
          }`}
        />
        
        {/* Tall elegant stand - upper section */}
        <div 
          className={`w-3 mx-auto transition-all duration-500 z-10 ${
            isLightOn ? 'bg-gradient-to-b from-primary to-primary/80' : 'bg-gradient-to-b from-muted-foreground/60 to-muted-foreground/40'
          }`}
          style={{ height: '140px' }}
        />
        
        {/* Stand decorative middle piece */}
        <div 
          className={`w-6 h-6 mx-auto rounded-full transition-all duration-500 z-10 shadow-md ${
            isLightOn ? 'bg-primary' : 'bg-muted-foreground/50'
          }`}
        />
        
        {/* Lower stand section */}
        <div 
          className={`w-3 mx-auto transition-all duration-500 z-10 ${
            isLightOn ? 'bg-gradient-to-b from-primary/80 to-primary/60' : 'bg-gradient-to-b from-muted-foreground/50 to-muted-foreground/40'
          }`}
          style={{ height: '80px' }}
        />
        
        {/* Base connector */}
        <div className="flex flex-col items-center z-10">
          <div 
            className={`w-8 h-3 rounded-sm transition-all duration-500 shadow-sm ${
              isLightOn ? 'bg-primary' : 'bg-muted-foreground/60'
            }`}
          />
          {/* Main base */}
          <div 
            className={`w-24 h-5 rounded-full transition-all duration-500 shadow-lg ${
              isLightOn 
                ? 'bg-gradient-to-r from-primary via-primary/90 to-primary' 
                : 'bg-gradient-to-r from-muted-foreground/50 via-muted-foreground/60 to-muted-foreground/50'
            }`}
          />
        </div>
        
        {/* Pull cord with grab and pull effect */}
        <div 
          className={`absolute -right-20 top-24 z-20 ${isGrabbing ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setIsGrabbing(false)}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          style={{
            transformOrigin: 'top center',
            animation: !isLightOn && !isPulling && !isGrabbing ? 'swing 2.5s ease-in-out infinite' : 'none',
            transform: isGrabbing ? 'translateY(15px)' : isPulling ? 'translateY(30px)' : 'none',
            transition: 'transform 0.2s ease-out',
          }}
        >
          {/* Cord attachment point */}
          <div className={`w-3 h-3 rounded-full mx-auto shadow-sm ${isLightOn ? 'bg-primary' : 'bg-muted-foreground/70'}`} />
          {/* Cord */}
          <div 
            className={`w-1 mx-auto transition-all duration-300 shadow-sm ${
              isPulling ? 'h-28' : isGrabbing ? 'h-24' : 'h-20'
            } ${isLightOn ? 'bg-primary/70' : 'bg-muted-foreground/60'}`}
          />
          {/* Pull ball/tassel */}
          <div 
            className={`w-7 h-10 mx-auto rounded-b-full transition-all duration-200 shadow-lg ${
              isLightOn 
                ? 'bg-primary shadow-[0_0_25px_hsl(var(--primary)/0.6)]' 
                : isGrabbing
                  ? 'bg-accent scale-110'
                  : 'bg-muted-foreground/70 hover:bg-accent hover:scale-110'
            }`}
          />
          {/* Pull indicator */}
          {!isLightOn && !isPulling && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground font-medium whitespace-nowrap">
              {isGrabbing ? '↓ Pull!' : 'Grab'}
            </div>
          )}
        </div>
      </div>
      
      {/* Pull hint */}
      {showHint && !isLightOn && (
        <div className="absolute top-1/4 right-1/4 animate-bounce">
          <div className="flex items-center gap-2 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full border border-border shadow-lg">
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
            <p className="text-foreground text-sm font-medium tracking-wide">
              Pull the cord!
            </p>
          </div>
        </div>
      )}
      
      {/* Floor shadow */}
      <div 
        className={`absolute bottom-16 left-1/2 -translate-x-1/2 w-32 h-4 rounded-full blur-md transition-all duration-500 ${
          isLightOn ? 'bg-accent/40' : 'bg-foreground/20'
        }`}
      />
      
      {/* Floor glow when light is on */}
      {isLightOn && (
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-accent/30 to-transparent" />
      )}
      
      {/* Animations */}
      <style>{`
        @keyframes swing {
          0%, 100% { transform: rotate(-6deg); }
          50% { transform: rotate(6deg); }
        }
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes pulseGlow {
          0%, 100% { 
            opacity: 0.3;
            transform: translate(-50%, 0) scale(1);
          }
          50% { 
            opacity: 0.6;
            transform: translate(-50%, 0) scale(1.1);
          }
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
