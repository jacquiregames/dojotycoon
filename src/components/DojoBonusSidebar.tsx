// src/components/DojoBonusSidebar.tsx
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DOJO_COLOR_MAP, PLAYER_COLOR_MAP } from '../types';
import type { GameState, DojoName } from '../types';
import { trialDiceData } from '../config/trials';
import { TIER_THRESHOLDS } from '../config/investments';
import type { Card } from './CardRandomizer';

interface DiceMediaProps {
  dice: string;
  className: string;
}

function DiceMedia({ dice, className }: DiceMediaProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <img src={`/videos/dice/${dice}.png`} alt={dice} className={className} />;
  }

  return (
    <video
      src={`/videos/dice/${dice}.mp4`}
      autoPlay
      loop
      muted
      playsInline
      className={className}
      onError={() => setHasError(true)}
    />
  );
}

interface DojoBonusSidebarProps {
  step: string;
  mode: string;
  revealedCard: Card | null | undefined;
  gameState?: GameState;
}

export default function DojoBonusSidebar({ step, mode, revealedCard, gameState }: DojoBonusSidebarProps) {
  const revealedDojo = revealedCard?.content.dojo as DojoName | undefined;
  const bonusText = revealedCard?.content.bonusText; // <-- GRAB TEXT
  
  const eligiblePlayers = useMemo(() => {
    if (!gameState || !revealedDojo) return [];
    const dojoInvestments = gameState.investments[revealedDojo];
    if (!dojoInvestments) return [];
    return gameState.players.filter((_, i) => dojoInvestments[i] >= TIER_THRESHOLDS.TIER_2);
  }, [gameState, revealedDojo]);

  if (step !== 'result' || mode !== 'trials' || !revealedDojo) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={`trial-bonus-sidebar${eligiblePlayers.length > 0 ? ' has-bonus-players' : ''}`}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="trial-dice-container">
          {trialDiceData[revealedCard?.itemIdentifier as number]?.map((dice, index) => {
            const className = `trial-dice-image ${['dall', 'd412', 'd620', 'd820'].includes(dice) ? dice : ''}`;
            return (
              <DiceMedia 
                key={`${dice}-${index}`} 
                dice={dice} 
                className={className} 
              />
            );
          })}
        </div>

        <h2 className="bonus-dojo-name" style={{ '--dojo-color': DOJO_COLOR_MAP[revealedDojo] } as React.CSSProperties}>
          {revealedDojo} Bonus
        </h2>

        {/* INSERTED HERE */}
        {bonusText && (
          <p className="bonus-description">{bonusText}</p>
        )}

        {eligiblePlayers.length > 0 ? (
          <ul className="bonus-player-list">
            {eligiblePlayers.map(p => (
              <li key={p.name} style={{ color: PLAYER_COLOR_MAP[p.color] }}>
                {p.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="bonus-empty-msg">🖕(•̀_·́)🖕</p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}