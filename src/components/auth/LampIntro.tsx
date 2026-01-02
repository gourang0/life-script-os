import { useState, useEffect, useCallback } from 'react';
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

// Audio context singleton
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
};

export function LampIntro({ onComplete }: LampIntroProps) {
  const [isLightOn, setIsLightOn] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [isWiggling, setIsWiggling] = useState(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [isBlinking, setIsBlinking] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Sound effect: Click sound
  const playClickSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.log('Audio not available');
    }
  }, []);

  // Sound effect: Happy chime
  const playHappyChime = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      
      notes.forEach((freq, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
        
        const startTime = ctx.currentTime + index * 0.1;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.4);
      });
    } catch (e) {
      console.log('Audio not available');
    }
  }, []);

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
    playClickSound();
  };

  const handleMouseUp = () => {
    if (isLightOn || !isGrabbing) return;
    
    setIsGrabbing(false);
    setIsPulling(true);
    setShowHint(false);
    
    setTimeout(() => {
      setIsPulling(false);
      setIsLightOn(true);
      setIsWiggling(true);
      playHappyChime();
      
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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-1000 overflow-hidden`}
      style={{
        background: isLightOn 
          ? 'hsl(var(--background))' 
          : 'linear-gradient(180deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--background)) 100%)',
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
            className="absolute -top-8 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl"
            style={{
              background: 'hsl(var(--primary) / 0.3)',
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
            <svg viewBox="0 0 24 24" className="w-full h-full" style={{ fill: 'hsl(var(--accent))' }}>
              <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" />
            </svg>
          </div>
        ))}
        
        {/* Light glow effect - only when ON */}
        {isLightOn && (
          <>
            <div 
              className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse"
              style={{ background: 'hsl(var(--accent) / 0.4)' }}
            />
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-2xl"
              style={{ background: 'hsl(var(--accent) / 0.6)' }}
            />
          </>
        )}
        
        {/* Lamp Shade with hover sway */}
        <div 
          className="relative z-10"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          style={{
            animation: isHovering && !isLightOn ? 'sway 0.5s ease-in-out infinite' : 'none',
          }}
        >
          {/* Shade top rim - off-white/cream color */}
          <div 
            className="w-24 h-3 rounded-t-full mx-auto transition-all duration-500 border-t-2 border-x-2"
            style={{
              background: isLightOn 
                ? 'linear-gradient(180deg, #FFF8E7 0%, #FFE4B5 100%)' 
                : '#F5F5DC',
              borderColor: isLightOn ? '#FFD700' : '#D4C4A8',
              boxShadow: isLightOn ? '0 0 60px 30px hsl(var(--accent) / 0.6)' : 'none',
            }}
          />
          {/* Shade body - elegant trapezoid with cream/off-white fabric */}
          <div 
            className="w-40 h-32 mx-auto transition-all duration-500 relative border-x-2 border-b-2"
            style={{
              background: isLightOn 
                ? 'linear-gradient(180deg, #FFF8E7 0%, #FFE4B5 60%, #FFDAB9 100%)' 
                : 'linear-gradient(180deg, #F5F5DC 0%, #E8DCC8 60%, #D4C4A8 100%)',
              borderColor: isLightOn ? '#FFD700' : '#C4B098',
              clipPath: 'polygon(6% 0%, 94% 0%, 100% 100%, 0% 100%)',
              borderRadius: '0 0 6px 6px',
              boxShadow: isLightOn ? 'inset 0 0 40px rgba(255, 200, 100, 0.5)' : 'inset 0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            {/* Inner light glow */}
            {isLightOn && (
              <div 
                className="absolute inset-0" 
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 100%)' }}
              />
            )}
            
            {/* Fabric texture lines */}
            <div className="absolute inset-0 opacity-30">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute h-full w-px"
                  style={{ 
                    left: `${12 + i * 11}%`,
                    background: isLightOn ? 'rgba(255,255,255,0.4)' : 'rgba(139, 119, 101, 0.3)'
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Lamp Face - Smiley - positioned on the shade */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
            {/* Eyes */}
            <div className="flex gap-10 mb-3">
              <div 
                className="rounded-full transition-all duration-300"
                style={{ 
                  width: '20px',
                  height: isBlinking && !isLightOn ? '4px' : '20px',
                  background: isLightOn ? '#4A3728' : '#5D4E37',
                  boxShadow: isLightOn ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
                  animation: isLightOn ? 'happyEyes 0.5s ease-in-out 3' : 'none',
                }}
              />
              <div 
                className="rounded-full transition-all duration-300"
                style={{ 
                  width: '20px',
                  height: isBlinking && !isLightOn ? '4px' : '20px',
                  background: isLightOn ? '#4A3728' : '#5D4E37',
                  boxShadow: isLightOn ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
                  animation: isLightOn ? 'happyEyes 0.5s ease-in-out 3' : 'none',
                  animationDelay: '0.1s',
                }}
              />
            </div>
            {/* Mouth */}
            <div 
              className="transition-all duration-500"
              style={{
                width: isLightOn ? '48px' : '32px',
                height: isLightOn ? '24px' : '4px',
                borderBottom: isLightOn ? '4px solid #4A3728' : 'none',
                borderRadius: isLightOn ? '0 0 24px 24px' : '4px',
                background: isLightOn ? 'transparent' : '#5D4E37',
              }}
            />
          </div>
          
          {/* Pull cord attached at the right edge of the lamp shade bottom */}
          <div 
            className={`absolute z-30 ${isGrabbing ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => isGrabbing && setIsGrabbing(false)}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            style={{
              right: '-8px',
              top: '128px',
              transformOrigin: 'top center',
              animation: !isLightOn && !isPulling && !isGrabbing ? 'ropeSwing 3s ease-in-out infinite' : 'none',
            }}
          >
            {/* Cord attachment bracket - brass fitting at edge */}
            <div 
              className="w-3 h-3 rounded-full shadow-sm"
              style={{
                background: isLightOn 
                  ? 'radial-gradient(circle at 30% 30%, #FFD700, #DAA520)' 
                  : 'radial-gradient(circle at 30% 30%, #A08060, #8B7355)',
              }}
            />
            {/* Cord - braided rope */}
            <div 
              className="w-1 mx-auto rounded-full transition-all duration-200"
              style={{
                height: isPulling ? '100px' : isGrabbing ? '85px' : '70px',
                background: isLightOn 
                  ? 'linear-gradient(180deg, #D4A574 0%, #C19660 50%, #B8860B 100%)' 
                  : 'linear-gradient(180deg, #A08060 0%, #8B7355 50%, #6B5344 100%)',
                boxShadow: '1px 0 2px rgba(0,0,0,0.2)',
                transform: isGrabbing ? 'translateY(15px)' : isPulling ? 'translateY(30px)' : 'none',
                transition: 'height 0.15s ease-out, transform 0.15s ease-out',
              }}
            />
            {/* Pull ball/tassel - decorative brass ball */}
            <div 
              className="w-6 h-8 mx-auto rounded-full transition-all duration-200 shadow-lg"
              style={{
                background: isLightOn 
                  ? 'radial-gradient(circle at 30% 30%, #FFD700, #DAA520, #B8860B)' 
                  : isGrabbing
                    ? 'radial-gradient(circle at 30% 30%, hsl(var(--accent)), hsl(var(--accent) / 0.8))'
                    : 'radial-gradient(circle at 30% 30%, #C19A6B, #A0826D, #8B7355)',
                transform: isGrabbing ? 'translateY(15px) scale(1.15)' : isPulling ? 'translateY(30px) scale(1.1)' : 'scale(1)',
                boxShadow: isLightOn 
                  ? '0 0 25px hsl(var(--primary) / 0.6)' 
                  : isGrabbing 
                    ? '0 4px 12px rgba(0,0,0,0.3)' 
                    : '0 2px 6px rgba(0,0,0,0.2)',
                transition: 'transform 0.15s ease-out, box-shadow 0.15s ease-out',
              }}
            />
            {/* Pull indicator */}
            {!isLightOn && !isPulling && (
              <div 
                className="absolute left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap px-2 py-1 rounded-full"
                style={{
                  top: isPulling ? '140px' : isGrabbing ? '125px' : '100px',
                  color: 'hsl(var(--foreground))',
                  background: 'hsl(var(--card) / 0.9)',
                  border: '1px solid hsl(var(--border))',
                  transition: 'top 0.15s ease-out',
                }}
              >
                {isGrabbing ? '↓ Pull!' : '👆 Grab'}
              </div>
            )}
          </div>
        </div>
        
        {/* Lamp neck - brass/gold connector */}
        <div 
          className="w-4 h-5 mx-auto transition-all duration-500 z-10"
          style={{
            background: isLightOn 
              ? 'linear-gradient(180deg, #DAA520 0%, #B8860B 100%)' 
              : 'linear-gradient(180deg, #8B7355 0%, #6B5344 100%)',
          }}
        />
        
        {/* Decorative brass knob */}
        <div 
          className="w-8 h-4 mx-auto rounded-full transition-all duration-500 z-10 shadow-md"
          style={{
            background: isLightOn 
              ? 'linear-gradient(180deg, #FFD700 0%, #DAA520 100%)' 
              : 'linear-gradient(180deg, #A0826D 0%, #8B7355 100)',
          }}
        />
        
        {/* Tall elegant wooden stand - upper section */}
        <div 
          className="w-3 mx-auto transition-all duration-500 z-10"
          style={{ 
            height: '140px',
            background: isLightOn 
              ? 'linear-gradient(180deg, #8B4513 0%, #654321 50%, #5D3A1A 100%)' 
              : 'linear-gradient(180deg, #6B4423 0%, #5A3A1D 50%, #4A3018 100%)',
            boxShadow: '2px 0 4px rgba(0,0,0,0.2)',
          }}
        />
        
        {/* Stand decorative wooden middle piece */}
        <div 
          className="w-6 h-6 mx-auto rounded-full transition-all duration-500 z-10 shadow-md"
          style={{
            background: isLightOn 
              ? 'radial-gradient(circle at 30% 30%, #A0522D, #8B4513 50%, #654321)' 
              : 'radial-gradient(circle at 30% 30%, #7B4423, #6B3A1D 50%, #5A3018)',
          }}
        />
        
        {/* Lower wooden stand section */}
        <div 
          className="w-3 mx-auto transition-all duration-500 z-10"
          style={{ 
            height: '80px',
            background: isLightOn 
              ? 'linear-gradient(180deg, #654321 0%, #5D3A1A 50%, #4A2D0F 100%)' 
              : 'linear-gradient(180deg, #5A3A1D 0%, #4A3018 50%, #3A2510 100%)',
            boxShadow: '2px 0 4px rgba(0,0,0,0.2)',
          }}
        />
        
        {/* Wooden base connector */}
        <div className="flex flex-col items-center z-10">
          <div 
            className="w-8 h-3 rounded-sm transition-all duration-500 shadow-sm"
            style={{
              background: isLightOn 
                ? 'linear-gradient(180deg, #8B4513, #654321)' 
                : 'linear-gradient(180deg, #6B4423, #5A3A1D)',
            }}
          />
          {/* Main wooden base */}
          <div 
            className="w-24 h-5 rounded-full transition-all duration-500 shadow-lg"
            style={{
              background: isLightOn 
                ? 'linear-gradient(90deg, #654321, #8B4513, #A0522D, #8B4513, #654321)' 
                : 'linear-gradient(90deg, #4A3018, #6B4423, #7B4A28, #6B4423, #4A3018)',
            }}
          />
        </div>
      </div>
      
      {/* Pull hint */}
      {showHint && !isLightOn && (
        <div className="absolute top-1/4 right-1/4 animate-bounce">
          <div 
            className="flex items-center gap-2 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg"
            style={{
              background: 'hsl(var(--card) / 0.9)',
              border: '1px solid hsl(var(--border))',
            }}
          >
            <svg 
              className="w-5 h-5 animate-pulse" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{ color: 'hsl(var(--primary))' }}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 14l-7 7m0 0l-7-7m7 7V3" 
              />
            </svg>
            <p className="text-sm font-medium tracking-wide" style={{ color: 'hsl(var(--foreground))' }}>
              Pull the cord!
            </p>
          </div>
        </div>
      )}
      
      {/* Floor shadow */}
      <div 
        className="absolute bottom-16 left-1/2 -translate-x-1/2 w-32 h-4 rounded-full blur-md transition-all duration-500"
        style={{
          background: isLightOn ? 'hsl(var(--accent) / 0.4)' : 'rgba(0,0,0,0.2)',
        }}
      />
      
      {/* Floor glow when light is on */}
      {isLightOn && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-48"
          style={{
            background: 'linear-gradient(to top, hsl(var(--accent) / 0.3), transparent)',
          }}
        />
      )}
      
      {/* Animations */}
      <style>{`
        @keyframes swing {
          0%, 100% { transform: rotate(-6deg); }
          50% { transform: rotate(6deg); }
        }
        
        @keyframes ropeSwing {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes sway {
          0%, 100% { transform: rotate(-1deg); }
          50% { transform: rotate(1deg); }
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