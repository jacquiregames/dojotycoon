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
  }, [step, mode, itemIdentifier, setStatus]);

  // NEW: Memory leak fix - dump the video buffer when unmounting
  useEffect(() => {
    const videoElement = videoRef.current;
    return () => {
      if (videoElement) {
        videoElement.pause();
        videoElement.removeAttribute('src');
        videoElement.load();
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
