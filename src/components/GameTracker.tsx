import { useState, useEffect, useRef } from 'react';
import type { FocusCell, Player, RandomizerMode, RandomizerExtraProps, RandomizerResult } from '../types';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useDojoInvestments } from '../hooks/useDojoInvestments';
import { Fireworks } from "@fireworks-js/react";
import { ASSETS } from '../config/assets';

import CardRandomizer from './CardRandomizer';
import KenoRoulette from './KenoRoulette';
import TeamView from './TeamView';
import BossDamageTracker from './BossDamageTracker';
import ProgressiveJackpot from './ProgressiveJackpot';
import RoundChange from './RoundChange';
import GlobalControls from './GlobalControls';
import InvestmentTable from './InvestmentTable';
import RulesPopups from './RulesPopups';
import type { RulesPopupsHandle } from './RulesPopups';
import './GameTracker.css';

interface GameTrackerProps {
  initialPlayers: Player[];
  totalRounds: number; 
}

interface ModeStackItem {
  id: string;
  mode: RandomizerMode;
  players: Player[];
  clickedIndex?: number;
  extraProps?: RandomizerExtraProps;
}

// extraProps for a 'boss' mode item is normally { bossHealth, bossId }, but
// can also arrive as a bare number or undefined (see RandomizerExtraProps).
// Normalize it once here rather than repeating the typeof-narrowing at the
// call site.
function getBossProps(extraProps?: RandomizerExtraProps): { bossHealth: number; bossId?: number } {
  if (typeof extraProps === 'number') return { bossHealth: extraProps };
  return { bossHealth: extraProps?.bossHealth ?? 200, bossId: extraProps?.bossId };
}

export default function GameTracker({ initialPlayers, totalRounds }: GameTrackerProps) {
  const [modeStack, setModeStack] = useState<ModeStackItem[]>([]);
  const [changingRound, setChangingRound] = useState<number | null>(null);
  const [showOuttakes, setShowOuttakes] = useState(false);
  
  const [revealedTeams, setRevealedTeams] = useState<{ mode: '2v2' | '2v1' | '3v1' | 'tourny'; players: Player[]; autoMinimize?: boolean; isMinimized?: boolean } | null>(null);
  const [revealedMinigame, setRevealedMinigame] = useState<{ mode: 'keno' | 'roulette'; selectedNumbers: number[] } | null>(null);
  const [roundNumber, setRoundNumber] = useState(1);

  const [drawnCards, setDrawnCards] = useState<{ wager: string[]; 'prize-green': string[]; 'prize-red': string[]; trials: number[]; }>({
    wager: [], 'prize-green': [], 'prize-red': [], trials: [],
  });

  const rulesPopupsRef = useRef<RulesPopupsHandle>(null);

  useEffect(() => {
    let gameOverAudio: HTMLAudioElement | null = null;
    if (roundNumber > totalRounds && !showOuttakes) {
      gameOverAudio = new Audio(ASSETS.MUSIC.GAMEOVER);
      gameOverAudio.loop = true;
      const playPromise = gameOverAudio.play();
      if (playPromise !== undefined) playPromise.catch(() => {});
    }

    return () => {
      if (gameOverAudio) {
        gameOverAudio.pause();
        gameOverAudio.currentTime = 0;
        gameOverAudio.src = '';
      }
    };
  }, [roundNumber, showOuttakes, totalRounds]);

  useEffect(() => {
    const preventRefresh = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; 
    };
    window.addEventListener('beforeunload', preventRefresh);
    return () => window.removeEventListener('beforeunload', preventRefresh);
  }, []);

  const openRandomizer = (mode: RandomizerMode, players: Player[] = initialPlayers, clickedIndex?: number, extraProps?: RandomizerExtraProps) => {
    if (roundNumber > totalRounds || changingRound !== null) return; 
    setModeStack(prev => [...prev, { id: `${mode}-${Date.now()}-${Math.random()}`, mode, players, clickedIndex, extraProps }]);
  };

  const handleRandomizerClose = (result?: RandomizerResult) => {
    const closingMode = modeStack[modeStack.length - 1]?.mode;
    if (closingMode === 'trials') {
      setChangingRound(roundNumber);
      setRoundNumber(prev => prev + 1);
    }

    const isSubModeFromTrials = modeStack.length >= 2 && modeStack[modeStack.length - 2].mode === 'trials';
    setModeStack(prev => prev.slice(0, -1));
    
    if (result) {
      if (result.type === 'team') {
        setRevealedTeams({ mode: result.mode, players: result.players, autoMinimize: isSubModeFromTrials, isMinimized: false });
      } else if (result.type === 'minigame') {
        if (isSubModeFromTrials) {
          setRevealedMinigame({ mode: result.mode, selectedNumbers: result.selectedNumbers });
        } else {
          setRevealedMinigame(null);
        }
      } else if (result.type === 'single' && result.identifier !== undefined) {
        setDrawnCards(prev => {
          const newState = { ...prev };
          if (result.mode === 'trials') {
            newState.trials = [...newState.trials, result.identifier as number];
          } else if (['wager', 'prize-green', 'prize-red'].includes(result.mode)) {
            const key = result.mode as 'wager' | 'prize-green' | 'prize-red';
            newState[key] = [...newState[key], result.identifier as string];
          }
          return newState;
        });

        if (result.mode === 'trials') {
          setRevealedTeams(null);
          setRevealedMinigame(null);
        }
      }
    } else {
      setRevealedTeams(null);
      setRevealedMinigame(null);
    }
  };

  const handlePlayerHeaderClick = (pIdx: number) => {
    if (roundNumber > totalRounds || changingRound !== null) return; 
    const otherPlayers = initialPlayers.filter((_, index) => index !== pIdx);
    openRandomizer('player-draw', otherPlayers, pIdx);
  };

  const [focus, setFocus] = useState<FocusCell>({ dojoIndex: 0, type: 'investment', playerIndex: 0 });
  const { state, handleUpdate, getTotalInvestment } = useDojoInvestments(initialPlayers, totalRounds);

  useKeyboardShortcuts({
    randomizerMode: modeStack.length > 0 ? modeStack[modeStack.length - 1].mode : null,
    revealedTeams,
    playerCount: state.players.length,
    focus,
    setFocus,
    handleUpdate: (delta) => handleUpdate(delta, focus, roundNumber, changingRound !== null),
    handlePlayerHeaderClick,
    openRandomizer,
    roundNumber,
    totalRounds, 
    isChangingRound: changingRound !== null,
    openVampPopup: () => rulesPopupsRef.current?.openVamp(),
    openBoardNinjaPopup: () => rulesPopupsRef.current?.openBoardNinja(), 
    openArguePopup: () => rulesPopupsRef.current?.openArgue()
  });

  return (
    <div className="game-tracker-container">
      {modeStack.map((item, idx) => {
        const isActive = idx === modeStack.length - 1 && (!revealedTeams || !!revealedTeams.isMinimized);

        if (item.mode === 'jackpot') return <ProgressiveJackpot key={item.id} onClose={handleRandomizerClose} isActive={isActive} />;
        if (item.mode === 'keno' || item.mode === 'roulette') return <KenoRoulette key={item.id} mode={item.mode} onClose={handleRandomizerClose} isActive={isActive} />;
        if (item.mode === 'boss') {
          const bossProps = getBossProps(item.extraProps);
          return <BossDamageTracker key={item.id} players={item.players} initialHealth={bossProps.bossHealth} bossId={bossProps.bossId} onClose={handleRandomizerClose} isActive={isActive} />;
        }
        return <CardRandomizer key={item.id} allPlayers={item.players} mode={item.mode} onClose={handleRandomizerClose} onSubMode={(mode, extraProps) => openRandomizer(mode, item.players, undefined, extraProps)} isActive={isActive} gameState={state} extraProps={item.extraProps} drawnCards={drawnCards} totalRounds={totalRounds} />;
      })}

      {revealedTeams && <TeamView mode={revealedTeams.mode} selected={revealedTeams.players} onClose={() => setRevealedTeams(null)} autoMinimize={revealedTeams.autoMinimize} onMinimize={() => setRevealedTeams(prev => prev ? { ...prev, isMinimized: true } : null)} />}
      {revealedMinigame && <KenoRoulette mode={revealedMinigame.mode} initialNumbers={revealedMinigame.selectedNumbers} isMinimized={true} onClose={() => setRevealedMinigame(null)} isActive={false} />}

      <GlobalControls 
        roundNumber={roundNumber} totalRounds={totalRounds} playerCount={initialPlayers.length} isChangingRound={changingRound !== null}
        openRandomizer={openRandomizer} setShowOuttakes={setShowOuttakes}
        openVampPopup={() => rulesPopupsRef.current?.openVamp()}
        openBoardNinjaPopup={() => rulesPopupsRef.current?.openBoardNinja()}
        openArguePopup={() => rulesPopupsRef.current?.openArgue()}         
      />

      <InvestmentTable
        state={state}
        focus={focus}
        setFocus={setFocus}
        handlePlayerHeaderClick={handlePlayerHeaderClick}
        roundNumber={roundNumber}
        totalRounds={totalRounds}
        changingRound={changingRound}
        getTotalInvestment={getTotalInvestment}
      />

      <RulesPopups ref={rulesPopupsRef} playerCount={initialPlayers.length} />

      {changingRound !== null && <RoundChange currentRound={changingRound} totalRounds={totalRounds} onComplete={() => setChangingRound(null)} />}

      {showOuttakes && (
        <div className="outtakes-video-overlay" onClick={() => setShowOuttakes(false)}>
          <video src={ASSETS.VIDEOS.OUTTAKES} autoPlay playsInline className="outtakes-video" onEnded={() => setShowOuttakes(false)} />
        </div>
      )}

      {roundNumber > totalRounds && (
        <Fireworks
          options={{ opacity: 0.5, intensity: 15, friction: 0.97, acceleration: 1.05, hue: { min: 10, max: 290 }, delay: { min: 30, max: 60 }}}
          style={{ top: 0, left: 0, width: "100%", height: "100%", position: "fixed", zIndex: 2, filter: "brightness(1.2)", pointerEvents: "none" }}
        />
      )}
    </div>
  );
}

