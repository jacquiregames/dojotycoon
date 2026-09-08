import { useEffect, useRef } from 'react'; // Added useRef
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
  const videoRef = useRef<HTMLVideoElement>(null); // NEW: Reference for the video

  useEffect(() => {
    if (step === 'result' && mode === 'trials' && itemIdentifier && status === 'idle') {
      setStatus('checking');
      const videoUrl = `/videos/trialvideos/${itemIdentifier}.mp4`;
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
  }, [step, mode, itemIdentifier, setStatus]);

  // Pause on unmount to stop network activity immediately. (Previously
  // this also stripped the src via removeAttribute()+load(), but that
  // broke playback under StrictMode's dev-mode double-invoke - see the
  // identical fix note in LandingPage.tsx for the full explanation.)
  useEffect(() => {
    const videoElement = videoRef.current;

    // Explicitly (re-)start playback rather than relying solely on the
    // autoPlay attribute, which only fires once at DOM insertion -
    // StrictMode's double-invoke (mount -> cleanup -> mount again) would
    // otherwise leave the video paused via the pause() below with nothing
    // left to resume it.
    if (videoElement) {
      videoElement.play().catch(() => {});
    }

    return () => {
      if (videoElement) {
        videoElement.pause();
      }
    };
  }, [status]); // Run cleanup when status changes (which unmounts the video)

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
            ref={videoRef} // NEW: Attach the ref
            src={`/videos/trialvideos/${itemIdentifier}.mp4`}
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
