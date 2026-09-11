// hooks/useSafeTimeout.ts
import { useRef, useEffect, useCallback } from 'react';

export function useSafeTimeout() {
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => timeoutsRef.current.forEach(clearTimeout);
  }, []);

  return useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
    return id;
  }, []);
}
