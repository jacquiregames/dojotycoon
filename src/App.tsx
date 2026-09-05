import { useState } from 'react';
import LandingPage from './components/LandingPage';
import GameTracker from './components/GameTracker';
import WheelSpin from './components/WheelSpin';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { KeyRouterProvider } from './hooks/useKeyRouter';
import './App.css';
import type { Player } from './types'; 

export default function App() {
  const [gameConfig, setGameConfig] = useState<{players: Player[], totalRounds: number} | null>(null);
  const [step, setStep] = useState<'landing' | 'wheel' | 'game'>('landing');

  let view;
  
  if (step === 'landing') {
    view = (
      <motion.div
        key="landing"
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        <LandingPage onStart={(players, totalRounds) => {
          setGameConfig({ players, totalRounds });
          setStep('wheel');
        }} />
      </motion.div>
    );
  } else if (step === 'wheel') {
    view = (
      <motion.div
        key="wheel"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.5 }}
      >
        <WheelSpin onContinue={() => setStep('game')} />
      </motion.div>
    );
  } else {
    view = (
      <motion.div
        key="game"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, type: 'spring', damping: 20 }}
      >
        {gameConfig && <GameTracker initialPlayers={gameConfig.players} totalRounds={gameConfig.totalRounds} />}
      </motion.div>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <KeyRouterProvider>
        <main className="app-main">
          <AnimatePresence mode="wait">
            {view}
          </AnimatePresence>
        </main>
      </KeyRouterProvider>
    </MotionConfig>
  );
}

