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
  const [topSrc, setTopSrc] = useState<string>(PHASE_CONFIG.round1.trans);
  const [bottomSrc, setBottomSrc] = useState<string>(PHASE_CONFIG.round1.loop);

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

  // When the phase changes, load the next transition video and hide the
  // tracker until it's had its crossfade moment.
  useEffect(() => {
    setIsTopVisible(false); // Reset visibility for the new phase's top video so it fades in cleanly
    setTopSrc(PHASE_CONFIG[phase].trans);
    setIsTrackerVisible(false);
  }, [phase]);

  const handleTopLoaded = () => {
    setIsTopVisible(true);

    if (topRef.current) {
      topRef.current.currentTime = 0; // Extra assurance that the new instance starts at 0
      topRef.current.play().catch(() => {});
    }

    // Delay swapping the bottom video's loop until the top video has fully faded in (0.8s CSS transition).
    // This prevents the bottom loop from flashing or turning black while it's still partially visible.
    if (bottomTimeoutRef.current) window.clearTimeout(bottomTimeoutRef.current);
    bottomTimeoutRef.current = window.setTimeout(() => {
      setBottomSrc(PHASE_CONFIG[phase].loop);
    }, 850);

    // Attempt to start music if it was blocked by autoplay policy until now.
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
    }
  };

  const handleTopEnded = useCallback(() => {
    if (PHASE_CONFIG[phase].isFinal) {
      // success.mp4 / defeat.mp4 just finished - hand off to the 16.mp4
      // finale video.
      onComplete();
    } else if (bottomRef.current) {
      bottomRef.current.play().then(() => {
        setIsTopVisible(false);
        setIsTrackerVisible(true);
      }).catch(() => {
        // Even if the loop video can't play, don't strand the fight on a
        // black screen - reveal the tracker anyway.
        setIsTopVisible(false);
        setIsTrackerVisible(true);
      });
    } else {
      setIsTopVisible(false);
      setIsTrackerVisible(true);
    }
  }, [phase, onComplete]);

  // Safety net: if a transition video is missing or stalls, don't leave the
  // fight stuck on a black screen forever - proceed as if it had ended.
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
        src={bottomSrc}
        loop
        muted
        playsInline
        preload="auto"
        onError={() => { 
          if (!isTopVisible) setIsTrackerVisible(true);
        }}
      />

      <video
        key={topSrc} // 🔑 Forces React to fully remount a new video tag, permanently preventing stale frame flashes
        ref={topRef}
        className={`fbs-video fbs-top-video ${isTopVisible ? 'visible' : 'hidden'}`}
        src={topSrc}
        autoPlay
        playsInline
        preload="auto" 
        onLoadedData={handleTopLoaded}
        onEnded={handleTopEnded}
        onError={handleTopEnded}
      />

      <div className={`fbs-rules-container ${isTrackerVisible ? 'visible' : ''}`}>
        <img src="/images/backgrounds/finalbossrules.png" alt="Rules" className="fbs-rules-image" />
      </div>

      <div className={`fbs-tracker-wrap ${isTrackerVisible ? 'visible' : ''}`}>
        <BossDamageTracker
          players={players}
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