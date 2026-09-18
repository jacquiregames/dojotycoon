import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ASSETS } from '../config/assets';
import './Toasty.css';

export default function Toasty() {
  const [isVisible, setIsVisible] = useState(false);
  const [side, setSide] = useState<'left' | 'right'>('right');

  useEffect(() => {
    // Run every minute (60,000ms) for testing
    const interval = setInterval(() => {
      setSide((prev) => (prev === 'left' ? 'right' : 'left'));
      setIsVisible(true);

      // Play the audio cue (Standalone, fire-and-forget over current media)
      const toastyAudio = new Audio(ASSETS.MUSIC.TOASTY);
      toastyAudio.play().catch(e => console.warn("Toasty audio prevented by browser:", e));

      // Persist for 1 second before animating off
      setTimeout(() => {
        setIsVisible(false);
      }, 1000);
    }, 600000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.img
          src={`/images/ninjas/toasty_${side}.png`}
          alt="Toasty"
          className={`toasty-image toasty-${side}`}
          initial={{ x: side === 'left' ? '-100%' : '100%' }}
          animate={{ x: 0 }}
          exit={{ x: side === 'left' ? '-100%' : '100%' }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        />
      )}
    </AnimatePresence>
  );
}