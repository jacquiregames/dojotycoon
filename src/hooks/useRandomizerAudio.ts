import { useState, useEffect } from 'react';
import type { RandomizerMode } from '../types';
import { ASSETS } from '../config/assets';

export function useRandomizerAudio(mode: RandomizerMode, totalRounds: number, roundNumber?: number) {
  const [audioDelayPassed, setAudioDelayPassed] = useState(false);

  // 1. Play looping background music for Wager and Prize draws
  useEffect(() => {
    let drawAudio: HTMLAudioElement | null = null;
    if (['wager', 'prize-green', 'prize-red'].includes(mode)) {
      drawAudio = new Audio(ASSETS.getRandomizerMusic(mode));
      drawAudio.loop = true;
      const playPromise = drawAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => { /* ignore abort errors */ });
      }
    }
    return () => {
      if (drawAudio) {
        drawAudio.pause();
        drawAudio.currentTime = 0;
        drawAudio.src = '';
      }
    };
  }, [mode]);

  // 2. Play Boss intro sound
  useEffect(() => {
    let bossIntroAudio: HTMLAudioElement | null = null;
    const bossRounds = totalRounds === 10 ? [5] : [5, 10];
    
    if (mode === 'trials' && roundNumber && bossRounds.includes(roundNumber)) {
      bossIntroAudio = new Audio(ASSETS.MUSIC.BOSS_INTRO);
      const playPromise = bossIntroAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => { /* ignore abort errors */ });
      }
    }
    return () => {
      if (bossIntroAudio) {
        bossIntroAudio.pause();
        bossIntroAudio.currentTime = 0;
        bossIntroAudio.src = '';
      }
    };
  }, [mode, roundNumber, totalRounds]);

  // 3. Audio delay check for boss videos
  useEffect(() => {
    if (mode === 'trials' && roundNumber) {
      const bossRounds = totalRounds === 10 ? [5] : [5, 10];
      
      if (bossRounds.includes(roundNumber)) {
        const handleBossEnded = () => setAudioDelayPassed(true);
        window.addEventListener('bossVideoEnded', handleBossEnded);
        
        const fallbackTimer = setTimeout(() => setAudioDelayPassed(true), 15000); 

        return () => {
          window.removeEventListener('bossVideoEnded', handleBossEnded);
          clearTimeout(fallbackTimer);
        };
      } else {
        setAudioDelayPassed(true);
      }
    }
  }, [mode, roundNumber, totalRounds]);

  // 4. Play Trial Round Music once the delay allows it
  useEffect(() => {
    let trialAudio: HTMLAudioElement | null = null;
    if (mode === 'trials' && roundNumber && audioDelayPassed) {
      trialAudio = new Audio(ASSETS.getTrialMusic(roundNumber));
      trialAudio.loop = true;
      const playPromise = trialAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => { /* ignore abort errors */ });
      }
    }
    return () => {
      if (trialAudio) {
        trialAudio.pause();
        trialAudio.currentTime = 0;
        trialAudio.src = '';
      }
    };
  }, [mode, roundNumber, audioDelayPassed]);
}

