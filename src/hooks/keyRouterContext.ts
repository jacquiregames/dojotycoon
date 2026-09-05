// src/hooks/keyRouterContext.ts
//
// Shared context/types for the key router. Split out from useKeyRouter.tsx
// (the provider component) and useKeyRouterLayer.ts (the consumer hook) so
// neither of those files has to mix component and non-component exports -
// see the comment in useKeyRouter.tsx for why that split matters.

import { createContext } from 'react';

// Return `true` to claim the event and stop it from reaching lower layers.
// Return `false`/`undefined` to let it fall through.
export type KeyRouterHandler = (e: KeyboardEvent) => boolean | void;

export interface LayerEntry {
  id: number;
  layer: number;
  onKeyDown: KeyRouterHandler;
  onKeyUp?: KeyRouterHandler;
}

export interface KeyRouterContextValue {
  register: (entry: Omit<LayerEntry, 'id'>) => number;
  unregister: (id: number) => void;
}

export const KeyRouterContext = createContext<KeyRouterContextValue | null>(null);

