// src/hooks/useKeyRouter.tsx
//
// A single, centralized keyboard listener for the whole app.
//
// Why this exists: previously almost every overlay (BossDamageTracker,
// KenoRoulette, CardRandomizer, TeamView, the media popups, the main
// investment grid) each called window.addEventListener('keydown', ..., 
// { capture: true }) independently. Because capture-phase listeners on the
// SAME target (window) all fire regardless of e.stopPropagation() (only
// e.stopImmediatePropagation() would stop sibling listeners, and only ones
// registered after it), multiple overlays could react to the exact same
// keystroke at once - e.g. a media popup opening in the middle of boss
// damage entry.
//
// This hook fixes that by making ONE listener the single source of truth.
// Components register a "layer" (a priority + a handler) instead of their
// own listener. On every keydown/keyup, the router calls handlers from
// highest layer to lowest, stopping as soon as one returns `true`
// ("I handled this, don't let anything below me see it").
//
// This file exports ONLY the provider component. The consumer hook
// (useKeyRouterLayer) and the priority constants (KEY_LAYERS) live in
// useKeyRouterLayer.ts, and the shared context/types live in
// keyRouterContext.ts - react-refresh/only-export-components requires a
// .tsx file to export components and nothing else, or Fast Refresh can't
// reliably hot-reload it without losing state.

import React, { useCallback, useEffect, useRef } from 'react';
import { KeyRouterContext } from './keyRouterContext';
import type { KeyRouterContextValue, LayerEntry } from './keyRouterContext';

let nextEntryId = 1;

export function KeyRouterProvider({ children }: { children: React.ReactNode }) {
  const entriesRef = useRef<LayerEntry[]>([]);

  const register = useCallback((entry: Omit<LayerEntry, 'id'>) => {
    const id = nextEntryId++;
    entriesRef.current = [...entriesRef.current, { id, ...entry }];
    return id;
  }, []);

  const unregister = useCallback((id: number) => {
    entriesRef.current = entriesRef.current.filter((e) => e.id !== id);
  }, []);

  const dispatch = useCallback((e: KeyboardEvent, phase: 'onKeyDown' | 'onKeyUp') => {
    const entries = entriesRef.current;
    if (entries.length === 0) return;

    // Highest layer wins. Within the same layer, the most recently
    // registered entry wins (e.g. a randomizer opened on top of another).
    const ordered = [...entries].sort((a, b) => {
      if (a.layer !== b.layer) return b.layer - a.layer;
      return b.id - a.id;
    });

    for (const entry of ordered) {
      const handler = entry[phase];
      if (!handler) continue;
      const handled = handler(e);
      if (handled) break; // claimed - nothing lower gets this event
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => dispatch(e, 'onKeyDown');
    const onKeyUp = (e: KeyboardEvent) => dispatch(e, 'onKeyUp');

    window.addEventListener('keydown', onKeyDown, { capture: true });
    window.addEventListener('keyup', onKeyUp, { capture: true });
    return () => {
      window.removeEventListener('keydown', onKeyDown, { capture: true });
      window.removeEventListener('keyup', onKeyUp, { capture: true });
    };
  }, [dispatch]);

  const value = useRef<KeyRouterContextValue>({ register, unregister }).current;

  return <KeyRouterContext.Provider value={value}>{children}</KeyRouterContext.Provider>;
}


