import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useCountUp } from '../hooks/useCountUp';
import { INITIAL_HEALTH, PLAYERS, ROUNDS, TOTAL_ENTRIES } from '../constants';
import type { DamageGrid, GameResult } from '../types';

import HealthPanel from './HealthPanel';
import DamageTable from './DamageTable';
import Keypad from './Keypad';

function createEmptyGrid(): DamageGrid {
  return PLAYERS.map(() => ROUNDS.map(() => null));
}

interface DamageTrackerProps {
  isActive: boolean;
  onRoundComplete?: (round: number) => void;
  onGameEnd?: (result: 'success' | 'fail') => void;
}

export default function DamageTracker({ isActive, onRoundComplete, onGameEnd }: DamageTrackerProps) {
  const [health, setHealth] = useState(INITIAL_HEALTH);
  const [grid, setGrid] = useState<DamageGrid>(createEmptyGrid);
  const [entryCount, setEntryCount] = useState(0);
  const [inputBuffer, setInputBuffer] = useState('');
  const [result, setResult] = useState<GameResult>(null);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const animatedHealth = useCountUp(health, 400);

  const appRef = useRef<HTMLElement>(null);
  const keyTimerRef = useRef<number | null>(null);

  const activeRow = entryCount % PLAYERS.length;
  const activeCol = Math.floor(entryCount / PLAYERS.length);
  const isPlaying = result === null && entryCount < TOTAL_ENTRIES;

  const roundTotals = ROUNDS.map((_, col) =>
    entryCount >= (col + 1) * PLAYERS.length
      ? grid.reduce((total, row) => total + (row[col] ?? 0), 0)
      : null,
  );

  const flashKey = useCallback((key: string) => {
    if (keyTimerRef.current !== null) window.clearTimeout(keyTimerRef.current);
    setPressedKey(key);
    keyTimerRef.current = window.setTimeout(() => setPressedKey(null), 140);
  }, []);

  useEffect(() => () => {
    if (keyTimerRef.current !== null) window.clearTimeout(keyTimerRef.current);
  }, []);

  const appendDigit = useCallback((digit: string) => {
    if (result !== null || !isActive) return;
    setInputBuffer(current => current.length < 6 ? current + digit : current);
    flashKey(digit);
  }, [result, isActive, flashKey]);

  const eraseDigit = useCallback(() => {
    if (result !== null || !isActive) return;
    setInputBuffer(current => current.slice(0, -1));
    flashKey('backspace');
  }, [result, isActive, flashKey]);

  const submitEntry = useCallback(() => {
    if (result !== null || !isActive) return;
    if (inputBuffer === '' || entryCount >= TOTAL_ENTRIES) return;

    const damage = Number(inputBuffer);
    const row = entryCount % PLAYERS.length;
    const col = Math.floor(entryCount / PLAYERS.length);
    const nextHealth = health - damage;
    const nextCount = entryCount + 1;

    setGrid(current => current.map((values, rowIndex) =>
      rowIndex === row
        ? values.map((value, colIndex) => colIndex === col ? damage : value)
        : values,
    ));
    setHealth(nextHealth);
    setEntryCount(nextCount);
    setInputBuffer('');
    flashKey('enter');

    // State Machine Check for App.tsx
    if (nextHealth <= 0) {
      setResult('success');
      if (onGameEnd) onGameEnd('success');
    } else if (nextCount === TOTAL_ENTRIES) {
      setResult('fail');
      if (onGameEnd) onGameEnd('fail');
    } else if (nextCount % PLAYERS.length === 0) {
      const roundFinished = nextCount / PLAYERS.length;
      if (onRoundComplete) onRoundComplete(roundFinished + 1);
    }
  }, [result, isActive, inputBuffer, entryCount, health, flashKey, onGameEnd, onRoundComplete]);

  useEffect(() => {
    // Completely disable keyboard listeners while the tracker is invisible
    if (!isActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
      const target = event.target;
      if (target instanceof HTMLElement && (
        target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      )) return;

      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        appendDigit(event.key);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (!event.repeat) submitEntry();
      } else if (event.key === 'Backspace') {
        event.preventDefault();
        eraseDigit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, appendDigit, eraseDigit, submitEntry]);

  return (
    <div className="app-shell">
      <main className="main-row" ref={appRef} tabIndex={-1} aria-label="Boss damage tracker">
        <div className="left-column">
          <HealthPanel health={health} animatedHealth={animatedHealth} />
          <DamageTable 
            grid={grid} 
            isPlaying={isPlaying} 
            activeRow={activeRow} 
            activeCol={activeCol} 
            inputBuffer={inputBuffer} 
            roundTotals={roundTotals} 
          />
        </div>



        <p className="sr-only" role="status">
          {result !== null
            ? `${result === 'success' ? 'Success. Boss defeated.' : 'Fail. Boss survived.'} Encounter ending.`
            : `Health: ${health}. ${entryCount} of ${TOTAL_ENTRIES} entries logged. Next: ${PLAYERS[activeRow]}, round ${activeCol + 1}.`}
        </p>
      </main>
    </div>
  );
}