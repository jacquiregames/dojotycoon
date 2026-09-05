import { useState, useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export function useCountUp(endValue: number, duration: number = 500) {
  const [count, setCount] = useState(endValue);
  const countRef = useRef(count);
  countRef.current = count;
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    // Respect the OS-level reduce-motion preference: jump straight to the
    // target value instead of counting up to it.
    if (prefersReducedMotion) {
      setCount(endValue);
      return;
    }

    let startTimestamp: number | null = null;
    let rafId: number;
    const startValue = countRef.current;
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentCount = Math.floor(progress * (endValue - startValue) + startValue);
      
      setCount(currentCount);
      
      if (progress < 1) {
        rafId = window.requestAnimationFrame(step);
      }
    };

    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
    // countRef is intentionally not a dependency: it's a ref, so reading
    // .current here always gets the latest value without needing to
    // re-run this effect (and restart the animation) on every frame's
    // setCount call. Only a genuine change to what we're animating
    // towards (endValue) or how fast (duration) should restart it.
  }, [endValue, duration, prefersReducedMotion]);

  return count;
}


