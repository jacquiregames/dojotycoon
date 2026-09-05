// src/components/TrialVideoOverlay.tsx
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { RandomizerMode } from '../types';

export type TrialVideoStatus = 'idle' | 'checking' | 'playing' | 'done';

interface TrialVideoOverlayProps {
  step: string;
  mode: RandomizerMode;
  itemIdentifier?: string | number;
  status: TrialVideoStatus;
  setStatus: (s: TrialVideoStatus) => void;
}

export default function TrialVideoOverlay({ step, mode, itemIdentifier, status, setStatus }: TrialVideoOverlayProps) {
  // Check if a specific trial video exists.
  // NOTE: `status` is intentionally NOT a dependency here even though the
  // guard below reads it. This should only run once per revealed trial
  // card (keyed on itemIdentifier). If `status` were a dependency, our own
  // setStatus('checking') call would immediately re-trigger this effect,
  // and the abort-on-cleanup below would cancel the fetch we just started
  // before it could ever resolve - leaving status stuck on 'checking'
  // forever (no trial video, and anything waiting on trialVideoStatus
  // === 'done' to auto-open, like Keno/Roulette/Boss, never fires).
  useEffect(() => {
    if (step === 'result' && mode === 'trials' && itemIdentifier && status === 'idle') {
      setStatus('checking');
      const videoUrl = `/trialvideos/${itemIdentifier}.mp4`;
      const controller = new AbortController();

      fetch(videoUrl, { method: 'HEAD', signal: controller.signal })
        .then(res => {
          if (res.ok) setStatus('playing');
          else setStatus('done');
        })
        .catch((err) => {
          if (err.name !== 'AbortError') setStatus('done');
        });

      return () => controller.abort();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, mode, itemIdentifier, setStatus]);

  return (
    <AnimatePresence>
      {status === 'playing' && itemIdentifier && (
        <motion.div 
          className="trial-video-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setStatus('done')}
        >
          <video
            src={`/trialvideos/${itemIdentifier}.mp4`}
            autoPlay
            playsInline
            className="trial-video-media"
            onEnded={() => setStatus('done')}
            onError={() => setStatus('done')}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
