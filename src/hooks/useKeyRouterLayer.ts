// src/hooks/useKeyRouterLayer.ts
//
// Consumer-side half of the key router (see useKeyRouter.tsx for the
// provider and the full design rationale).

import { useContext, useEffect, useRef } from 'react';
import { KeyRouterContext } from './keyRouterContext';
import type { KeyRouterHandler } from './keyRouterContext';

/**
 * Register a keydown (and optionally keyup) handler at a given priority
 * layer. Only registered while `active` is true - matches the old pattern
 * of components only attaching a listener while they were on-screen/active.
 *
 * The handler you pass doesn't need to be memoized: the latest version is
 * always used via a ref, so it's safe to define it inline in your component
 * body using current props/state.
 */
export function useKeyRouterLayer(
  layer: number,
  onKeyDown: KeyRouterHandler,
  active: boolean,
  onKeyUp?: KeyRouterHandler
) {
  const ctx = useContext(KeyRouterContext);
  if (!ctx) {
    throw new Error('useKeyRouterLayer must be used inside a <KeyRouterProvider>');
  }

  const onKeyDownRef = useRef(onKeyDown);
  onKeyDownRef.current = onKeyDown;
  const onKeyUpRef = useRef(onKeyUp);
  onKeyUpRef.current = onKeyUp;

  useEffect(() => {
    if (!active) return;
    const id = ctx.register({
      layer,
      onKeyDown: (e) => onKeyDownRef.current(e),
      // Always register a wrapper, and read the ref at call time (not at
      // registration time). Previously this checked onKeyUpRef.current's
      // truthiness once, when the effect ran - so a component that started
      // out with no onKeyUp and later began passing one (without `active`
      // or `layer` changing) would never have it picked up.
      onKeyUp: (e) => onKeyUpRef.current?.(e),
    });
    return () => ctx.unregister(id);
    // ctx, onKeyDownRef and onKeyUpRef are all stable across renders (ctx
    // comes from a useRef-backed provider value, the other two are refs),
    // so only `active` and `layer` actually need to retrigger this effect.
  }, [active, layer, ctx]);
}

// Fixed priority tiers, lowest to highest. Anything in a higher tier always
// gets first look at a keystroke; it only reaches a lower tier if the
// higher handler returns a falsy value (i.e. explicitly ignores that key).
export const KEY_LAYERS = {
  BASE: 10, // main investment grid navigation (useKeyboardShortcuts)
  MEDIA_POPUP: 20, // vamp / board-ninja info popups
  OVERLAY: 30, // CardRandomizer, KenoRoulette, BossDamageTracker, TeamView
} as const;

