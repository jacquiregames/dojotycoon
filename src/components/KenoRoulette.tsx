import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "motion/react";
import { useKeyRouterLayer, KEY_LAYERS } from "../hooks/useKeyRouterLayer";
import type { RandomizerResult } from "../types";
import "./KenoRoulette.css";

const TOTAL_CELLS = 12;
const COLUMNS = 4;
const NUMBERS_TO_PICK = 5;

// Move the array generation outside the component so it doesn't trigger re-renders
const NUMBERS = Array.from({ length: TOTAL_CELLS }, (_, i) => i + 1);

interface KenoRouletteProps {
  mode: "keno" | "roulette";
  onClose: (result?: RandomizerResult) => void;
  isActive: boolean;
  initialNumbers?: number[];
  isMinimized?: boolean;
}

function shuffleArray(array: number[]): number[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function KenoRoulette({ mode, onClose, isActive, initialNumbers, isMinimized }: KenoRouletteProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<Set<number>>(
    initialNumbers ? new Set(initialNumbers) : new Set()
  );
  const[isPlaying, setIsPlaying] = useState(!initialNumbers);
  const [isClosing, setIsClosing] = useState(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current =[];
  };

  const playKeno = useCallback(() => {
    const shuffled = shuffleArray(NUMBERS);
    const picked = shuffled.slice(0, NUMBERS_TO_PICK);

    picked.forEach((number, index) => {
      const tid = setTimeout(() => {
        setSelectedNumbers((prev) => new Set([...prev, number]));

        if (index === NUMBERS_TO_PICK - 1) {
          const finishTid = setTimeout(() => {
            setIsPlaying(false);
          }, 500);
          timeoutsRef.current.push(finishTid);
        }
      }, (index + 1) * 800);
      timeoutsRef.current.push(tid);
    });
  },[]); 

  const playRoulette = useCallback(() => {
    const finalNumber = Math.floor(Math.random() * TOTAL_CELLS) + 1;
    const spinCount = 12;
    const spinDelay = 80;
    const slowDownStart = 8;

    for (let i = 0; i < spinCount; i++) {
      const delay = i < slowDownStart
        ? i * spinDelay
        : slowDownStart * spinDelay + (i - slowDownStart) * spinDelay * 3;

      const tid = setTimeout(() => {
        if (i < spinCount - 1) {
          // Flash a random number while spinning
          const randomNum = Math.floor(Math.random() * TOTAL_CELLS) + 1;
          setSelectedNumbers(new Set([randomNum]));
        } else {
          // Land on final number
          setSelectedNumbers(new Set([finalNumber]));
          const finishTid = setTimeout(() => setIsPlaying(false), 500);
          timeoutsRef.current.push(finishTid);
        }
      }, delay);
      timeoutsRef.current.push(tid);
    }
  },[]);

  // Handle animation play sequence
  useEffect(() => {
    if (initialNumbers) return; // Skip animation if we're rendering from a minimized state
    clearAllTimeouts();
    setSelectedNumbers(new Set());
    setIsPlaying(true);

    if (mode === "keno") {
      playKeno();
    } else {
      playRoulette();
    }

    return clearAllTimeouts;
  },[mode, playKeno, playRoulette, initialNumbers]);

  // Handle auto-minimize timer once animation completes
  useEffect(() => {
    if (!isPlaying && !isMinimized && !initialNumbers) {
      const tid = setTimeout(() => {
        if (!isClosing) {
          onClose({ type: 'minigame', mode, selectedNumbers: Array.from(selectedNumbers) });
        }
      }, 3000); // 4 seconds before auto shrinking to the corner
      return () => clearTimeout(tid);
    }
  },[isPlaying, isMinimized, initialNumbers, isClosing, mode, selectedNumbers, onClose]);
 
  const handleContinue = useCallback(() => {
    if (isPlaying) return;
    setIsClosing(true);
    setTimeout(() => {
      if (isMinimized) {
        onClose(); // Cleanly unmount if already in the corner
      } else {
        onClose({ type: 'minigame', mode, selectedNumbers: Array.from(selectedNumbers) });
      }
    }, 300);
  }, [isPlaying, onClose, mode, selectedNumbers, isMinimized]);

  // Self-contained keyboard logic, routed through the central priority
  // stack. "Never block underlying shortcuts if minimized" is now expressed
  // as simply not registering this layer at all while minimized - the
  // router then naturally falls through to whatever's below (usually the
  // investment grid).
  const handleKeyDown = useCallback((e: KeyboardEvent): boolean => {
    const isEnter = e.key === 'Enter' || e.code === 'NumpadEnter';
    const isZero = e.key === '0' || e.code === 'Numpad0';

    if ((isZero || isEnter) && !isPlaying) {
      e.preventDefault();
      handleContinue();
    } else {
      e.preventDefault();
    }
    return true; // trap all keys while active and not minimized
  }, [isPlaying, handleContinue]);

  const handleKeyUp = useCallback((e: KeyboardEvent): boolean => {
    e.preventDefault();
    return true;
  }, []);

  useKeyRouterLayer(KEY_LAYERS.OVERLAY, handleKeyDown, isActive && !isMinimized, handleKeyUp);

  return (
    <motion.div
      className={`keno-roulette-overlay ${isMinimized ? "minimized" : ""}`}
      initial={{ opacity: 0 }}
      animate={isClosing ? { opacity: 0 } : { opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={!isPlaying && !isMinimized ? handleContinue : undefined}
    >
      <motion.div
        className="keno-roulette-content"
        initial={isMinimized ? false : { scale: 0.8, opacity: 0 }}
        animate={isClosing ? { scale: 0.8, opacity: 0 } : { scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="keno-header">
          <h1 className="keno-title">{mode.toUpperCase()}</h1>
        </div>

        {/* Grid */}
        <div
          className="number-grid"
          style={{ gridTemplateColumns: `repeat(${COLUMNS}, minmax(0, 1fr))` }}
        >
          {NUMBERS.map((num) => {
            const isSelected = selectedNumbers.has(num);
            return (
              <div
                key={num}
                className={`number-cell ${
                  isSelected ? "number-cell-selected" : "number-cell-default"
                }`}
              >
                {num}
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}


