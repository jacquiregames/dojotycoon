import { useState, useCallback } from 'react';
import { useKeyRouterLayer, KEY_LAYERS } from './useKeyRouterLayer';

export function useMediaPopup(
  sequence: 'image-first' | 'video-first' = 'image-first',
  onClose?: () => void
) {
  const [state, setState] = useState<'hidden' | 'image' | 'video'>('hidden');

  // Single source of truth for "advance to the next stage of the popup".
  // Both the keyboard shortcut (Enter/0) and any mouse/tap handler call
  // this same function, so the two input methods can never disagree about
  // what happens next - previously a click handler re-implemented this
  // sequencing separately and could fall out of sync with the keyboard path.
  const advance = useCallback(() => {
    if (sequence === 'image-first') {
      if (state === 'image') {
        setState('video');
      } else if (state === 'video') {
        setState('hidden');
        if (onClose) onClose();
      }
    } else if (sequence === 'video-first') {
      if (state === 'video') {
        setState('image'); // Skip video and go to static image
      } else if (state === 'image') {
        setState('hidden'); // Close popup entirely
        if (onClose) onClose();
      }
    }
  }, [state, sequence, onClose]);

  // Trap all keys while the popup is open, and advance if Enter/0 is pressed
  const handleKeyDown = useCallback((e: KeyboardEvent): boolean => {
    e.preventDefault();

    const isAdvanceKey = e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Numpad0' || e.code === 'Digit0';
    if (isAdvanceKey) advance();

    return true; // Return true to trap all other keystrokes
  }, [advance]);

  // Only register this keyboard trap if the popup is NOT hidden
  useKeyRouterLayer(KEY_LAYERS.MEDIA_POPUP, handleKeyDown, state !== 'hidden');

  return { state, setState, advance };
}


