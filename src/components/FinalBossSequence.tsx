// src/components/FinalBossSequence.tsx

import { useCallback, useEffect, useRef, useState } from 'react';
import BossDamageTracker from './BossDamageTracker';
import { getFinalBossHealth } from '../config/assets';
import type { Player } from '../types';
import './FinalBossSequence.css';

type Phase = 'round1' | 'round2' | 'round3' | 'success' | 'defeat';

const PHASE_CONFIG: Record<Phase, { trans: string; loop: string; isFinal: boolean }> = {
  round1: { trans: '/videos/finalboss/round1.mp4', loop: '/videos/finalboss/loop1.mp4', isFinal: false },
  round2: { trans: '/videos/finalboss/round2.mp4', loop: '/videos/finalboss/loop2.mp4', isFinal: false },
  round3: { trans: '/videos/finalboss/round3.mp4', loop: '/videos/finalboss/loop3.mp4', isFinal: false },
  // Final videos just play once; there's no loop to crossfade to.
  success: { trans: '/videos/finalboss/success.mp4', loop: '/videos/finalboss/success.mp4', isFinal: true },
  defeat: { trans: '/videos/finalboss/defeat.mp4', loop: '/videos/finalboss/defeat.mp4', isFinal: true },
};

interface FinalBossSequenceProps {
  players: Player[];
  onComplete: () => void;
}

export default function FinalBossSequence({ players, onComplete }: FinalBossSequenceProps) {
  const topRef = useRef<HTMLVideoElement>(null);
  const bottomRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const bottomTimeoutRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<Phase>('round1');
  
  // 🔑 Synchronously derived so it maps instantly when phase changes
  const topSrc = PHASE_CONFIG[phase].trans;
  
  // 🔑 Fix: Start empty! If this is loop1.mp4, you will see it bleeding 
  // through the opacity fade-in of round1.mp4, creating the "stale flash" illusion.
  const [bottomSrc, setBottomSrc] = useState<string>('');

  const [isTopVisible, setIsTopVisible] = useState<boolean>(false);
  const [isTrackerVisible, setIsTrackerVisible] = useState<boolean>(false);
 
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }
    return () => {
      audio?.pause();
      if (bottomTimeoutRef.current) window.clearTimeout(bottomTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    setIsTopVisible(false); // Ensures every new phase top-video starts hidden for a clean fade-in
    setIsTrackerVisible(false);
  }, [phase]);

  const handleTopLoaded = () => {
    if (topRef.current) {
      topRef.current.currentTime = 0; 
      topRef.current.play().catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    // Reveal top video only once it is actively ticking forward
    if (!isTopVisible && topRef.current && topRef.current.currentTime > 0.05) {
      setIsTopVisible(true);

      // Delay slotting the bottom video's loop until the top video has fully faded in (0.8s)
      if (bottomTimeoutRef.current) window.clearTimeout(bottomTimeoutRef.current);
      bottomTimeoutRef.current = window.setTimeout(() => {
        setBottomSrc(PHASE_CONFIG[phase].loop);
      }, 850);

      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const handleTopEnded = useCallback(() => {
    if (PHASE_CONFIG[phase].isFinal) {
      onComplete();
    } else if (bottomRef.current && bottomSrc) {
      bottomRef.current.play().then(() => {
        setIsTopVisible(false);
        setIsTrackerVisible(true);
      }).catch(() => {
        setIsTopVisible(false);
        setIsTrackerVisible(true);
      });
    } else {
      setIsTopVisible(false);
      setIsTrackerVisible(true);
    }
  }, [phase, onComplete, bottomSrc]);

  // Safety net
  useEffect(() => {
    if (isTopVisible) return;
    const fallback = setTimeout(() => {
      if (!isTopVisible) handleTopEnded();
    }, 8000);
    return () => clearTimeout(fallback);
  }, [phase, isTopVisible, handleTopEnded]);

  return (
    <div className="final-boss-sequence">
      <audio ref={audioRef} src="/music/finalboss.mp3" loop preload="auto" />

      <video
        ref={bottomRef}
        className="fbs-video fbs-bottom-video"
        src={bottomSrc ? bottomSrc : undefined}
        loop
        muted
        playsInline
        preload="auto"
        onError={() => { 
          if (!bottomSrc) return; // Ignore missing src errors from the empty initialization
          if (!isTopVisible) setIsTrackerVisible(true);
        }}
      />

      <video
        key={topSrc}
        ref={topRef}
        className={`fbs-video fbs-top-video ${isTopVisible ? 'visible' : 'hidden'}`}
        src={topSrc}
        autoPlay
        playsInline
        preload="auto" 
        onLoadedData={handleTopLoaded}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTopEnded}
        onError={handleTopEnded}
      />

      <div className={`fbs-rules-container ${isTrackerVisible ? 'visible' : ''}`}>
        <img src="/images/backgrounds/finalbossrules.png" alt="Rules" className="fbs-rules-image" />
      </div>

      <div className={`fbs-tracker-wrap ${isTrackerVisible ? 'visible' : ''}`}>
        <BossDamageTracker
          players={players}
          bossType="boss"
          initialHealth={getFinalBossHealth(players.length)}
          variant="final"
          healthLabel="Final Boss Health"
          isActive={isTrackerVisible}
          onClose={onComplete}
          onRoundComplete={(nextRound) => setPhase(nextRound === 2 ? 'round2' : 'round3')}
          onGameEnd={(result) => setPhase(result === 'success' ? 'success' : 'defeat')}
        />
      </div>
    </div>
  );
}