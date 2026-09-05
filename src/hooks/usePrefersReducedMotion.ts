import { useState, useEffect } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Tracks the OS-level "reduce motion" preference (e.g. vestibular
 * sensitivity). The global CSS rule in index.css handles every
 * transition/@keyframes animation automatically, but it can't touch
 * JS-driven animation logic - requestAnimationFrame loops (useCountUp) or
 * setTimeout-sequenced reveals (WheelSpin's spin, CardRandomizer's
 * shuffle/flip sequence). Those read this hook directly and skip straight
 * to the end state instead of animating.
 *
 * Live-updates if the user changes the OS setting while the app is open,
 * rather than only reading it once on mount.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const handleChange = () => setPrefersReduced(mql.matches);
    handleChange();
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  return prefersReduced;
}

