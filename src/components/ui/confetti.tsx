import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  color: string;
  rotation: number;
  size: number;
}

interface ConfettiProps {
  isActive: boolean;
  onComplete?: () => void;
  duration?: number;
  pieceCount?: number;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  '#FFD700',
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
];

export function Confetti({ 
  isActive, 
  onComplete, 
  duration = 3000,
  pieceCount = 100 
}: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShow(true);
      const newPieces: ConfettiPiece[] = Array.from({ length: pieceCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360,
        size: 8 + Math.random() * 8,
      }));
      setPieces(newPieces);

      const timer = setTimeout(() => {
        setShow(false);
        setPieces([]);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isActive, duration, pieceCount, onComplete]);

  if (!show) return null;

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${piece.x}%`,
            top: '-20px',
            animationDelay: `${piece.delay}s`,
            animationDuration: `${2 + Math.random()}s`,
          }}
        >
          <div
            className="confetti-piece"
            style={{
              width: piece.size,
              height: piece.size * 0.6,
              backgroundColor: piece.color,
              transform: `rotate(${piece.rotation}deg)`,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            }}
          />
        </div>
      ))}
      
      {/* Center burst effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full animate-burst"
              style={{
                backgroundColor: COLORS[i % COLORS.length],
                transform: `rotate(${i * 30}deg) translateY(-50px)`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}