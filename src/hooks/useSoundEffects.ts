import { useCallback, useRef } from 'react';

// Sound effect URLs (using Web Audio API synthesized sounds)
const createAudioContext = () => {
  return new (window.AudioContext || (window as any).webkitAudioContext)();
};

export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = createAudioContext();
    }
    return audioContextRef.current;
  }, []);

  const playTaskComplete = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      oscillator.type = 'sine';
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.4);
    } catch (error) {
      console.log('Sound not available');
    }
  }, [getAudioContext]);

  const playLevelUp = useCallback(() => {
    try {
      const ctx = getAudioContext();
      
      // Create a more elaborate level-up sound
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      
      notes.forEach((freq, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        const startTime = ctx.currentTime + index * 0.15;
        
        oscillator.frequency.setValueAtTime(freq, startTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
      });
      
      // Add a shimmer effect
      const shimmer = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      
      shimmer.connect(shimmerGain);
      shimmerGain.connect(ctx.destination);
      
      shimmer.frequency.setValueAtTime(1500, ctx.currentTime);
      shimmer.frequency.linearRampToValueAtTime(3000, ctx.currentTime + 0.6);
      shimmer.type = 'sine';
      
      shimmerGain.gain.setValueAtTime(0.1, ctx.currentTime);
      shimmerGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      
      shimmer.start(ctx.currentTime);
      shimmer.stop(ctx.currentTime + 0.6);
    } catch (error) {
      console.log('Sound not available');
    }
  }, [getAudioContext]);

  const playGoalComplete = useCallback(() => {
    try {
      const ctx = getAudioContext();
      
      // Triumphant fanfare
      const fanfare = [
        { freq: 523.25, time: 0, duration: 0.2 },      // C5
        { freq: 659.25, time: 0.15, duration: 0.2 },   // E5
        { freq: 783.99, time: 0.3, duration: 0.2 },    // G5
        { freq: 1046.50, time: 0.45, duration: 0.4 },  // C6
        { freq: 987.77, time: 0.6, duration: 0.15 },   // B5
        { freq: 1046.50, time: 0.75, duration: 0.5 },  // C6
      ];
      
      fanfare.forEach(({ freq, time, duration }) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        const startTime = ctx.currentTime + time;
        
        oscillator.frequency.setValueAtTime(freq, startTime);
        oscillator.type = 'triangle';
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.03);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      });
    } catch (error) {
      console.log('Sound not available');
    }
  }, [getAudioContext]);

  const playClick = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.05);
    } catch (error) {
      console.log('Sound not available');
    }
  }, [getAudioContext]);

  return {
    playTaskComplete,
    playLevelUp,
    playGoalComplete,
    playClick,
  };
}