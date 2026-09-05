import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { PLAYER_COLOR_MAP } from '../types';
import type { Player } from '../types';
import { useCountUp } from '../hooks/useCountUp'; 
import { useKeyRouterLayer, KEY_LAYERS } from '../hooks/useKeyRouterLayer';
import './BossDamageTracker.css';

interface BossDamageTrackerProps {
  players: Player[];
  initialHealth: number;
  bossId?: number;
  onClose: () => void;
  isActive: boolean;
}
 
const BOSS_ROUNDS_COUNT = 3;
const ROUNDS = Array.from({ length: BOSS_ROUNDS_COUNT }, (_, i) => i + 1);

type Grid = (number | null)[][];
type ModalState = 'none' | 'success' | 'fail';

export default function BossDamageTracker({ players, initialHealth, bossId, onClose, isActive }: BossDamageTrackerProps) {
  const pCount = players.length; 
  const TOTAL_ENTRIES = pCount * BOSS_ROUNDS_COUNT;  
  const [grid, setGrid] = useState<Grid>(() => 
    Array.from({ length: pCount }, () => Array(BOSS_ROUNDS_COUNT).fill(null))
  );

  const entryToCell = useCallback((entryIndex: number): [number, number] => {
    const col = Math.floor(entryIndex / pCount);
    const row = entryIndex % pCount;
    return [row, col];
  }, [pCount]);

  const [introPlaying, setIntroPlaying] = useState(!!bossId);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [health, setHealth] = useState(initialHealth);
  const animatedHealth = useCountUp(health, 400);
  const [entryCount, setEntryCount] = useState(0);   
  const [inputBuffer, setInputBuffer] = useState(''); 
  const [modal, setModal] = useState<ModalState>('none');
   
  const isEvaluatingRef = useRef(false);
 
  useEffect(() => {
    if (!introPlaying || !bossId || !isActive) return;
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.warn("Boss video autoplay prevented:", e));
    }
  }, [introPlaying, bossId, isActive]);

  const colTotals: (number | null)[] = ROUNDS.map((_, colIdx) => {
    const lastEntryOfRound = colIdx * pCount + (pCount - 1);
    if (entryCount > lastEntryOfRound) {
      return grid.reduce((sum, row) => sum + (row[colIdx] ?? 0), 0);
    }
    return null;
  });

  const appendDigit = useCallback((digit: string) => {
    if (introPlaying || modal !== 'none' || isEvaluatingRef.current) return;
    setInputBuffer(prev => (prev.length >= 6 ? prev : prev + digit));
  }, [introPlaying, modal]);

  const submitEntry = useCallback(() => { 
    if (introPlaying || isEvaluatingRef.current) return;
    if (modal === 'success' || modal === 'fail') {
      onClose();
      return;
    }

    if (inputBuffer === '' || entryCount >= TOTAL_ENTRIES) return;

    const value = parseInt(inputBuffer, 10);
    if (isNaN(value)) {
      setInputBuffer('');
      return;
    }

    const [row, col] = entryToCell(entryCount);
    const newGrid = grid.map(r => [...r]) as Grid;
    newGrid[row][col] = value;

    const newHealth = health - value;
    const newEntryCount = entryCount + 1;

    setGrid(newGrid);
    setHealth(newHealth);
    setEntryCount(newEntryCount);
    setInputBuffer('');

    // DELAY THE MODAL: Let the players watch the health bar drop to zero first!
    if (newHealth <= 0) {
      isEvaluatingRef.current = true;
      setTimeout(() => {
        setModal('success');
        isEvaluatingRef.current = false;
      }, 600);
    } else if (newEntryCount >= TOTAL_ENTRIES) {
      isEvaluatingRef.current = true;
      setTimeout(() => {
        setModal('fail');
        isEvaluatingRef.current = false;
      }, 600);
    }
  }, [introPlaying, modal, inputBuffer, entryCount, health, grid, onClose, TOTAL_ENTRIES, entryToCell]);
 
  const handleKeyDown = useCallback((e: KeyboardEvent): boolean => {
    e.preventDefault();

    const k = e.key;
    const code = e.code;
     
    let digit: string | null = null;
    if (k >= '0' && k <= '9') {
      digit = k;
    } else if (code && code.startsWith('Numpad') && code.length === 7) {
      const num = code[6];
      if (num >= '0' && num <= '9') {
        digit = num;
      }
    }

    if (digit !== null) {
      appendDigit(digit);
    } else if (k === 'Enter' || k === 'Return' || code === 'NumpadEnter') {
      submitEntry();
    } else if (k === 'Escape' || k === 'Delete') {
      setInputBuffer(''); // Instantly clear on Escape/Delete
    } else if (k === 'Backspace') {
      setInputBuffer(prev => prev.slice(0, -1));
    }
    
    return true;
  }, [appendDigit, submitEntry]);

  const handleKeyUp = useCallback((e: KeyboardEvent): boolean => {
    e.preventDefault();
    return true;
  }, []);

  useKeyRouterLayer(KEY_LAYERS.OVERLAY, handleKeyDown, isActive, handleKeyUp);

  const appRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isActive && !introPlaying) appRef.current?.focus();
  }, [isActive, introPlaying]);

  if (introPlaying && bossId) {
    return (
      <div className="boss-intro-overlay">
        <div className="boss-intro-video-container">
          <video
            ref={videoRef}
            src={`/bosses/${bossId}.mp4`}
            autoPlay
            playsInline
            className="boss-intro-video"
            onEnded={() => {
              setIntroPlaying(false); 
              window.dispatchEvent(new Event('bossVideoEnded')); 
            }}
          />
        </div>
      </div>
    );
  }

  const [activeRow, activeCol] = entryCount < TOTAL_ENTRIES ? entryToCell(entryCount) : [-1, -1];
  const healthPercent = Math.max(0, Math.min(100, (health / initialHealth) * 100));
  const healthTone = healthPercent <= 25 ? 'critical' : healthPercent <= 50 ? 'warning' : 'stable';

  const PLAYERS = Array.from({ length: pCount }, (_, i) => players[i]?.name || `Player ${i + 1}`);
  
  return (
    <motion.div 
      className="boss-damage-tracker-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={() => {
         if (modal !== 'none') {
            submitEntry();
         }
      }}
    >
      <div className="boss-wrapper" ref={appRef} tabIndex={-1} style={{ outline: 'none' }} onClick={e => e.stopPropagation()}>
        <div className="main-row">
          <div className="left-column">
            <header className={`boss-container health-container health-${healthTone}`}> 
              <h1>Health: {animatedHealth}</h1>
              <div className="health-meter" aria-hidden="true">
                <div className="health-meter-fill" style={{ width: `${healthPercent}%` }} />
              </div>
            </header>

            <div className="boss-container container-table">
              <table className="damage-table">
                <thead>
                  <tr>
                    <th>Player Name</th>
                    <th>Round 1</th>
                    <th>Round 2</th>
                    <th>Round 3</th>
                  </tr>
                </thead>
                <tbody>
                  {PLAYERS.map((player, rowIdx) => (
                    <tr key={`boss-row-${rowIdx}`}>
                      <td className="player-name" style={{ color: PLAYER_COLOR_MAP[players[rowIdx]?.color] || '#d9fbff' }}>{player}</td>
                      {ROUNDS.map((_, colIdx) => {
                        const isActiveCell = rowIdx === activeRow && colIdx === activeCol;
                        const cellVal = grid[rowIdx][colIdx];
                        const isFilled = cellVal !== null;

                        let cellClass = '';
                        if (isActiveCell) cellClass = 'active-cell';
                        else if (isFilled) cellClass = 'filled-cell';

                        return (
                          <td key={colIdx} className={cellClass}>
                            {isFilled
                              ? cellVal
                              : isActiveCell && inputBuffer !== ''
                                ? <span className="entry-preview">{inputBuffer}</span>
                                : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  <tr>
                    <td className="total-label">Round Damage</td>
                    {ROUNDS.map((_, colIdx) => {
                      const total = colTotals[colIdx];
                      return (
                        <td key={colIdx} className={total !== null ? 'total-filled' : ''}>
                          {total !== null ? total : '-'}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>

            </div>
          </div>
        </div>

        {modal !== 'none' && (
          <div className="modal-overlay" onClick={submitEntry}>
            <motion.div className={`modal-box ${modal}`} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={e => e.stopPropagation()}>
              <div className="modal-title">{modal === 'success' ? 'Success' : 'Fail'}</div> 
              <button className="modal-reset-btn" onClick={submitEntry}>CLOSE</button>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
}



