// src/hooks/useDojoInvestments.ts
import { useState, useCallback } from 'react';
import { getMaxInvestment, TIER_THRESHOLDS } from '../config/cardDecks';
import { DOJO_NAMES } from '../types';
import type { DojoName, GameState, FocusCell, Player } from '../types';

export function useDojoInvestments(initialPlayers: Player[], totalRounds: number) {
  const playerCount = initialPlayers.length;

  // Tier 3 starts at $300 for a 3-player game and $400 for a 4-player game
  // (see the Tier Range Guide images in GlobalControls.tsx: 300xxx.png vs
  // 400xxx.png). Tier 1 and Tier 2's boundaries don't depend on player
  // count - only where Tier 3 begins does.
  const tier3Threshold = playerCount * 100;

  // The total per-dojo investment cap, e.g. $600 for a 3-player/10-round
  // game (see MAX_INVESTMENT_BY_CONFIG / the Tier Range Guide images).
  const dojoInvestmentCap = getMaxInvestment(playerCount, totalRounds);

  const calculateTier = useCallback((totalInvestment: number): number => {
    if (totalInvestment >= tier3Threshold) return 3;
    if (totalInvestment >= TIER_THRESHOLDS.TIER_2) return 2;
    if (totalInvestment >= TIER_THRESHOLDS.TIER_1) return 1;
    return 0;
  }, [tier3Threshold]);

  const [state, setState] = useState<GameState>(() => {
    const initialInvestments: Record<string, number[]> = {};
    const initialTiers: Record<string, number> = {};
    const initialMajority: Record<string, number> = {};
    
    DOJO_NAMES.forEach(name => {
      initialInvestments[name] = new Array(initialPlayers.length).fill(0);
      initialTiers[name] = 0;
      initialMajority[name] = -1;
    });

    return {
      players: initialPlayers,
      dojoTiers: initialTiers as Record<DojoName, number>,
      investments: initialInvestments as Record<DojoName, number[]>,
      majorityInvestors: initialMajority as Record<DojoName, number>
    };
  });

  const handleUpdate = useCallback((delta: number, focus: FocusCell, roundNumber: number, isChangingRound: boolean) => {
    if (roundNumber > totalRounds || isChangingRound) return;
    
    setState(prev => {
      if (focus.type !== 'investment' || focus.playerIndex === undefined) return prev;
      
      const hIdx = focus.dojoIndex;
      const pIdx = focus.playerIndex;
      const dojoName = DOJO_NAMES[hIdx];
      if (!dojoName) return prev;

      const currentInvestments = [...prev.investments[dojoName]];
      
      // Calculate how much everyone ELSE has invested in this dojo
      const otherPlayersTotal = currentInvestments.reduce((sum, val, idx) => 
        sum + (idx === pIdx ? 0 : val), 0
      );
      
      // The maximum this specific player can invest is the per-game-config
      // cap (see dojoInvestmentCap) minus the other players' total.
      const maxAllowedForPlayer = dojoInvestmentCap - otherPlayersTotal;
      
      // Calculate new value: bounded by 0 on the low end, and the remaining cap on the high end
      const nextVal = Math.max(0, Math.min(maxAllowedForPlayer, currentInvestments[pIdx] + (delta * 10)));
      
      currentInvestments[pIdx] = nextVal;
      
      const newTotal = currentInvestments.reduce((a, b) => a + b, 0);
      const newTier = calculateTier(newTotal);

      let currentMajority = prev.majorityInvestors[dojoName];
      const maxInvestment = Math.max(...currentInvestments);

      if (maxInvestment === 0) {
        currentMajority = -1;
      } else {
        if (currentMajority !== -1 && currentInvestments[currentMajority] === maxInvestment) {
          // retain majority
        } else {
          currentMajority = currentInvestments.findIndex(v => v === maxInvestment);
        }
      }
      
      return {
        ...prev,
        investments: { ...prev.investments, [dojoName]: currentInvestments },
        dojoTiers: { ...prev.dojoTiers, [dojoName]: newTier },
        majorityInvestors: { ...prev.majorityInvestors, [dojoName]: currentMajority }
      };
    });
  }, [totalRounds, calculateTier, dojoInvestmentCap]);

  const getTotalInvestment = useCallback((dojoName: DojoName) => {
    return state.investments[dojoName].reduce((a, b) => a + b, 0);
  }, [state.investments]);

  return { state, handleUpdate, getTotalInvestment };
}

