// src/components/FinalBossSequence.tsx
//
// Final Boss video machine, adapted from the standalone Final Boss app's
// App.tsx: a looping background video per round (loop1/2/3.mp4) with a
// one-shot transition video crossfading in ahead of it (round1/2/3.mp4),
// then a one-shot success.mp4 or defeat.mp4 once the fight resolves.
//
// Unlike the standalone app - which reset back to round1 after success/
// defeat to loop forever as a demo - this version calls onComplete() once
// the outcome video finishes, so the caller (RoundChange) can cut to the
// 16.mp4 finale video.
//
// The actual damage entry (health, 3-round grid) is handled by the same
// BossDamageTracker used for every other boss in the game, in its 'final'
// (red) theme - it stays mounted for the whole fight so health/grid state
// survives every round transition, and is just faded in/out between phases.

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

  const [phase, setPhase] = useState<Phase>('round1');
  const [topSrc, setTopSrc] = useState<string>(PHASE_CONFIG.round1.trans);
  const [bottomSrc, setBottomSrc] = useState<string>(PHASE_CONFIG.round1.loop);

  const [isTopVisible, setIsTopVisible] = useState<boolean>(false);
  const [isTrackerVisible, setIsTrackerVisible] = useState<boolean>(false);

  // Set initial background music volume, start it as early as possible
  // (closest to the user gesture that triggered this encounter - closing
  // the final trial card), and make sure it stops if the encounter is torn
  // down (success/defeat video handing off to 16.mp4).
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }
    return () => {
      audio?.pause();
    };
  }, []);

  // When the phase changes, load the next transition video and hide the
  // tracker until it's had its crossfade moment.
  useEffect(() => {
    setTopSrc(PHASE_CONFIG[phase].trans);
    setIsTrackerVisible(false);
  }, [phase]);

  const handleTopLoaded = () => {
    setIsTopVisible(true);

    if (topRef.current) {
      topRef.current.play().catch(() => {});
    }

    // Silently prep the next loop while the transition video plays.
    setBottomSrc(PHASE_CONFIG[phase].loop);

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
          // A missing/broken loop video shouldn't block the fight - if
          // we're already meant to be showing the tracker, reveal it now.
          if (!isTopVisible) setIsTrackerVisible(true);
        }}
      />

      <video
        ref={topRef}
        className={`fbs-video fbs-top-video ${isTopVisible ? 'visible' : 'hidden'}`}
        src={topSrc}
        autoPlay
        playsInline
        preload="auto"
        poster="/images/backgrounds/finalboss.png"
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
