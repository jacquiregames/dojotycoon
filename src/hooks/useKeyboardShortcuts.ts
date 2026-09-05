// src/hooks/useKeyboardShortcuts.ts
import { DOJO_NAMES } from '../types';
import type { FocusCell, Player, RandomizerMode, RandomizerExtraProps } from '../types';
import { useKeyRouterLayer, KEY_LAYERS } from './useKeyRouterLayer';

interface UseKeyboardShortcutsParams {
  randomizerMode: RandomizerMode | null;
  revealedTeams: { mode: '2v2' | '2v1' | '3v1' | 'tourny'; players: Player[] } | null;
  playerCount: number;
  focus: FocusCell;
  setFocus: React.Dispatch<React.SetStateAction<FocusCell>>;
  handleUpdate: (delta: number) => void;
  handlePlayerHeaderClick: (pIdx: number) => void;
  openRandomizer: (mode: RandomizerMode, players?: Player[], clickedIndex?: number, extraProps?: RandomizerExtraProps) => void;
  roundNumber: number;
  totalRounds: number;
  isChangingRound: boolean;
  openVampPopup: () => void;
  openBoardNinjaPopup: () => void;
  openArguePopup: () => void; // NEW
}

export function useKeyboardShortcuts({
  randomizerMode,
  revealedTeams,
  playerCount,
  focus,
  setFocus,
  handleUpdate,
  handlePlayerHeaderClick,
  openRandomizer,
  roundNumber,
  totalRounds,
  isChangingRound,
  openVampPopup,
  openBoardNinjaPopup,
  openArguePopup // NEW
}: UseKeyboardShortcutsParams) {
  
  const active = !(randomizerMode || revealedTeams || roundNumber > totalRounds || isChangingRound);

  const handleKeyDown = (e: KeyboardEvent): boolean => {
    const dojoCount = DOJO_NAMES.length;
    let handled = true;

    switch (e.code) {
      case 'ArrowUp':
      case 'Numpad8': // Up
        e.preventDefault();
        setFocus(f => {
          if (f.type === 'investment') {
            if (f.dojoIndex > 0) return { ...f, dojoIndex: f.dojoIndex - 1 };
            return { type: 'header', dojoIndex: -1, playerIndex: f.playerIndex };
          }
          return f;
        });
        break;

      case 'ArrowDown':
      case 'Numpad2': // Down
        e.preventDefault();
        setFocus(f => {
          if (f.type === 'header' && f.playerIndex !== undefined) {
            return { type: 'investment', dojoIndex: 0, playerIndex: f.playerIndex };
          }
          if (f.type === 'investment') {
            if (f.dojoIndex === dojoCount - 1) return { type: 'header', dojoIndex: -1, playerIndex: f.playerIndex };
            return { ...f, dojoIndex: f.dojoIndex + 1 };
          }
          return f;
        });
        break;

      case 'ArrowLeft':
      case 'Numpad4': // Left
        e.preventDefault();
        setFocus(f => {
          if (f.type === 'header' && f.playerIndex !== undefined) {
            if (f.playerIndex === 0) return { type: 'investment', dojoIndex: dojoCount - 1, playerIndex: playerCount - 1 };
            return { ...f, playerIndex: f.playerIndex - 1 };
          }
          if (f.type === 'investment' && f.playerIndex !== undefined) {
            if (f.playerIndex > 0) return { ...f, playerIndex: f.playerIndex - 1 };
            if (f.dojoIndex > 0) return { ...f, dojoIndex: f.dojoIndex - 1, playerIndex: playerCount - 1 };
            return { type: 'header', dojoIndex: -1, playerIndex: playerCount - 1 };
          }
          return f;
        });
        break;

      case 'ArrowRight':
      case 'Numpad6': // Right
        e.preventDefault();
        setFocus(f => {
          if (f.type === 'header' && f.playerIndex !== undefined) {
            if (f.playerIndex === playerCount - 1) return { type: 'investment', dojoIndex: 0, playerIndex: 0 };
            return { ...f, playerIndex: f.playerIndex + 1 };
          }
          if (f.type === 'investment' && f.playerIndex !== undefined) {
            if (f.playerIndex < playerCount - 1) return { ...f, playerIndex: f.playerIndex + 1 };
            if (f.dojoIndex < dojoCount - 1) return { ...f, dojoIndex: f.dojoIndex + 1, playerIndex: 0 };
            return { type: 'header', dojoIndex: -1, playerIndex: 0 };
          }
          return f;
        });
        break;

      case 'Numpad9': // Increase
        e.preventDefault();
        if (focus.type === 'investment') handleUpdate(1);
        break;

      case 'Numpad7': // Decrease
        e.preventDefault();
        if (focus.type === 'investment') handleUpdate(-1);
        break;

      case 'Enter':
      case 'NumpadEnter':
        if (focus.type === 'header' && focus.playerIndex !== undefined) {
          e.preventDefault();
          handlePlayerHeaderClick(focus.playerIndex);
        } else {
          handled = false;
        }
        break;

      // --- BUTTON ORDER SHORTCUTS ---
      case 'Digit1':
      case 'Numpad1': // Vampire Overlay
        e.preventDefault();
        openVampPopup();
        break;
      
      case 'Digit3':
      case 'Numpad3': // Board Ninja Overlay
        e.preventDefault();
        openBoardNinjaPopup();
        break;

      case 'Digit5':
      case 'Numpad5': // Argue Overlay
        e.preventDefault();
        openArguePopup();
        break;

      case 'NumpadAdd': // Trials
        e.preventDefault();
        openRandomizer('trials', undefined, undefined, { roundNumber });
        break;
      case 'NumpadDivide': // Green Prize
        e.preventDefault();
        openRandomizer('prize-green');
        break;
      case 'NumpadMultiply': // Red Prize
        e.preventDefault();
        openRandomizer('prize-red');
        break;
      case 'NumpadSubtract': // Wager
        e.preventDefault();
        openRandomizer('wager');
        break;

      default:
        handled = false;
    }

    return handled;
  };

  useKeyRouterLayer(KEY_LAYERS.BASE, handleKeyDown, active);
}

