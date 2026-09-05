import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Player, GameState, DojoName, RandomizerMode, RandomizerResult, RandomizerExtraProps } from '../types';
import { WAGER_OPTIONS, GREEN_PRIZE_OPTIONS, RED_PRIZE_OPTIONS, TRIAL_OPTIONS, ROUND_TRIAL_MAP_10R_3P, ROUND_TRIAL_MAP_15R_3P, ROUND_TRIAL_MAP_10R_4P, ROUND_TRIAL_MAP_15R_4P } from '../config/cardDecks';
import { useKeyRouterLayer, KEY_LAYERS } from '../hooks/useKeyRouterLayer';
import { useRandomizerAudio } from '../hooks/useRandomizerAudio';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { ASSETS } from '../config/assets';
import RandomizerBackground from './RandomizerBackground';
import DojoBonusSidebar from './DojoBonusSidebar';
import TrialVideoOverlay from './TrialVideoOverlay';
import type { TrialVideoStatus } from './TrialVideoOverlay';
import './CardRandomizer.css';

// Intentionally module-level, NOT React state: each prize draw mounts a
// brand new CardRandomizer instance, so component state would reset the
// rotation back to video 0 every single time. These persist for the life
// of the page so the exit videos actually rotate across draws. Leave them
// as plain module variables - moving them into useState/useRef would
// silently break the rotation.
let greenPrizeVideoIndex = 0;
let redPrizeVideoIndex = 0;
const GREEN_VIDEOS = ['prize-green1.mp4', 'prize-green2.mp4', 'prize-green3.mp4'];
const RED_VIDEOS = ['prize-red1.mp4', 'prize-red2.mp4', 'prize-red3.mp4'];

const modeMap: Record<string, RandomizerMode> = {
  '2v2': '2v2',
  '3v1': '3v1',
  'tournament': 'tourny',
  'boss': 'boss',
  'keno': 'keno',
  'roulette': 'roulette',
  '2v1': '2v1',
  'jackpot': 'jackpot'
};

interface CardRandomizerProps {
  allPlayers: Player[];
  mode: RandomizerMode;
  onClose: (result?: RandomizerResult) => void;
  onSubMode?: (mode: RandomizerMode, extraProps?: RandomizerExtraProps) => void;
  isActive: boolean;
  gameState?: GameState;
  totalRounds: number;
  extraProps?: RandomizerExtraProps;
  drawnCards?: { wager: string[]; 'prize-green': string[]; 'prize-red': string[]; trials: number[]; };
}

export interface Card {
  id: string;
  itemIdentifier?: string | number;
  originalIndex: number;
  faceUp: boolean;
  isTop: boolean;
  topIndex: number;
  content: {
    type: 'player' | 'wager' | 'prize';
    player?: Player;
    wagerValue?: string;
    wagerImage?: string;
    prizeValue?: string;
    prizeImage?: string;
    dojo?: DojoName;
    trialType?: string;
    bossHealth?: number;
  };
  shufflePosition: { x: number; y: number; rotate: number };
}

type AnimationStep = 'init' | 'shuffle' | 'deck' | 'flip' | 'result';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function CardRandomizer({ allPlayers, mode, onClose, onSubMode, isActive, gameState, totalRounds, extraProps, drawnCards }: CardRandomizerProps) {
  const [step, setStep] = useState<AnimationStep>('init');
  const [isClosing, setIsClosing] = useState(false);
  const [trialVideoStatus, setTrialVideoStatus] = useState<TrialVideoStatus>('idle');
  const [exitVideoPlaying, setExitVideoPlaying] = useState(false);
  
  const isClosingRef = useRef(false);
  const hasInitialized = useRef(false);
  const autoTriggeredRef = useRef(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  // extraProps can arrive as a bare number for non-boss trial auto-triggers
  // (see RandomizerExtraProps) - normalize once so the rest of this
  // component can just read .roundNumber / .bossHealth / .bossId.
  const extraPropsObj = typeof extraProps === 'object' ? extraProps : undefined;

  useRandomizerAudio(mode, totalRounds, extraPropsObj?.roundNumber);

  const isSingleCardReveal = ['wager', 'prize-green', 'prize-red', 'player-draw', 'trials'].includes(mode);
  const isTeamMode = useMemo(() => ['2v2', '3v1', 'tourny', '2v1'].includes(mode as string), [mode]);
  const cardSpacing = isTeamMode ? 160 : 200;
  const topCardCount = mode === '2v1' ? 3 : (isTeamMode ? 4 : 1);

  const initialCards = useMemo(() => {
    let baseCards: Pick<Card, 'itemIdentifier' | 'content'>[] = [];
    
    if (mode === 'wager') {
      let available = WAGER_OPTIONS.filter(o => !(drawnCards?.wager || []).includes(o.image));
      if (available.length === 0) available = WAGER_OPTIONS; 
      baseCards = available.map(o => ({ itemIdentifier: o.image, content: { type: 'wager', wagerValue: o.value, wagerImage: o.image } })); 
    }
    else if (mode === 'prize-green') {
      let available = GREEN_PRIZE_OPTIONS.filter(o => !(drawnCards?.['prize-green'] || []).includes(o.image));
      if (available.length === 0) available = GREEN_PRIZE_OPTIONS;
      baseCards = available.map(o => ({ itemIdentifier: o.image, content: { type: 'prize', prizeValue: o.value, prizeImage: o.image } }));
    }
    else if (mode === 'prize-red') {
      let available = RED_PRIZE_OPTIONS.filter(o => !(drawnCards?.['prize-red'] || []).includes(o.image));
      if (available.length === 0) available = RED_PRIZE_OPTIONS; 
      baseCards = available.map(o => ({ itemIdentifier: o.image, content: { type: 'prize', prizeValue: o.value, prizeImage: o.image } }));
    }
    else if (mode === 'trials') {
      let roundOptions = TRIAL_OPTIONS;
      
      let ROUND_TRIAL_MAP;
      if (allPlayers.length === 3) {
        ROUND_TRIAL_MAP = totalRounds === 10 ? ROUND_TRIAL_MAP_10R_3P : ROUND_TRIAL_MAP_15R_3P;
      } else {
        ROUND_TRIAL_MAP = totalRounds === 10 ? ROUND_TRIAL_MAP_10R_4P : ROUND_TRIAL_MAP_15R_4P;
      }
      if (extraPropsObj?.roundNumber && ROUND_TRIAL_MAP[extraPropsObj.roundNumber]) {
        const validIds = ROUND_TRIAL_MAP[extraPropsObj.roundNumber];
        const filtered = TRIAL_OPTIONS.filter(o => validIds.includes(o.id));
        // Guard against a round map referencing ids that don't exist in
        // TRIAL_OPTIONS (a data typo) - fall back to the full trial pool
        // rather than silently ending up with zero cards to draw from.
        roundOptions = filtered.length > 0 ? filtered : TRIAL_OPTIONS;
      }
      // If every trial in this round's pool has already been drawn, reuse
      // that same round-appropriate pool rather than the entire deck.
      let available = roundOptions.filter(o => !(drawnCards?.trials || []).includes(o.id));
      if (available.length === 0) available = roundOptions; 
      
      baseCards = available.map(o => ({ itemIdentifier: o.id, content: { type: 'prize', prizeValue: o.value, prizeImage: o.image, dojo: o.dojo, trialType: o.trialType, bossHealth: o.bossHealth } }));
    }
    else {
      baseCards = allPlayers.map(p => ({ itemIdentifier: p.name, content: { type: 'player', player: p } }));
    }
    return baseCards.map((card, i) => ({
      ...card, id: `${mode}-${i}`, originalIndex: i, faceUp: false, isTop: false, topIndex: -1,
      shufflePosition: { x: Math.random() * 400 - 200, y: Math.random() * 300 - 150, rotate: Math.random() * 180 - 90 },
    }));
  }, [allPlayers, mode, extraPropsObj?.roundNumber, drawnCards, totalRounds]);

  // Seeded once, lazily, from whatever initialCards computed to on the
  // very first render. Deliberately NOT re-synced on every change to
  // initialCards: this component can remain mounted-but-inactive in the
  // background after a trial auto-triggers a submode on top of it (see
  // GameTracker's modeStack), and initialCards is memoized off the shared
  // `drawnCards` object from GameTracker. If some other, unrelated draw
  // changed `drawnCards` while this instance sat in the background, an
  // effect keyed on initialCards would silently reset this instance's
  // already-revealed card back to face-down. A lazy initializer sidesteps
  // that entirely - this instance's cards are fixed for its whole lifetime.
  const [cards, setCards] = useState<Card[]>(() => initialCards);

  const revealedCard = useMemo(() => {
    if (step !== 'result' || !isSingleCardReveal) return null;
    return cards.find(card => card.isTop);
  }, [cards, step, isSingleCardReveal]);

  // Determine if this revealed trial has an example image
  const exampleImage = useMemo(() => {
    if (step !== 'result' || mode !== 'trials' || !revealedCard) return null;
    const id = Number(revealedCard.itemIdentifier);
    if ([20, 21, 22, 23, 24, 25].includes(id)) return '/example/20_21_22_23_24_25.png';
    if ([44, 46, 48].includes(id)) return '/example/44_46_48.png';
    if ([45, 47, 49].includes(id)) return '/example/45_47_49.png';
    if (id === 50) return '/example/50.png';
    if (id === 51) return '/example/51.png';
    if (id === 53) return '/example/53.png';
    if (id === 55) return '/example/55.png';
    if (id === 58) return '/example/58.png';
    if (id === 60) return '/example/60.png';
    if (id === 62) return '/example/62.png';
    return null;
  }, [step, mode, revealedCard]);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const runAnimationSequence = async () => {
      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, prefersReducedMotion ? 0 : ms));
      
      setStep('init'); await delay(100);
      setStep('shuffle'); await delay(1500);
      setStep('deck'); await delay(800);

      const cardIndexes = Array.from({ length: initialCards.length }, (_, i) => i);
      const shuffledIndexes = shuffleArray(cardIndexes);
      const topCardIndexes = shuffledIndexes.slice(0, topCardCount);

      setCards(prev => {
        const newCards = prev.map((card) => {
          const topIdx = topCardIndexes.indexOf(card.originalIndex);
          if (topIdx !== -1) return { ...card, faceUp: true, isTop: true, topIndex: topIdx };
          return { ...card, isTop: false, topIndex: -1 };
        });
        
        return newCards.sort((a, b) => {
          if (a.isTop && !b.isTop) return 1;
          if (!a.isTop && b.isTop) return -1;
          if (a.isTop && b.isTop) return a.topIndex - b.topIndex;
          return a.originalIndex - b.originalIndex;
        });
      });

      setStep('flip'); await delay(800); 
      setStep('result');
    };

    runAnimationSequence();
  }, [initialCards.length, topCardCount, prefersReducedMotion]);

  const handleContinue = useCallback(async () => {
    if (isClosingRef.current) return;

    if ((mode === 'prize-green' || mode === 'prize-red') && !exitVideoPlaying) {
      setExitVideoPlaying(true);
      return; 
    }

    isClosingRef.current = true;
    
    if (mode === 'prize-green') {
      greenPrizeVideoIndex = (greenPrizeVideoIndex + 1) % GREEN_VIDEOS.length;
    } else if (mode === 'prize-red') {
      redPrizeVideoIndex = (redPrizeVideoIndex + 1) % RED_VIDEOS.length;
    }

    setIsClosing(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (isTeamMode) {
      const revealedPlayers = cards.filter(c => c.isTop).sort((a, b) => a.topIndex - b.topIndex).map(c => c.content.player).filter((p): p is Player => p !== undefined);
      onClose({ type: 'team', mode: mode as '2v2' | '2v1' | '3v1' | 'tourny', players: revealedPlayers });
    } else if (isSingleCardReveal) {
      onClose({ type: 'single', mode, identifier: revealedCard?.itemIdentifier });
    } else {
      onClose();
    }
  }, [onClose, cards, mode, isSingleCardReveal, revealedCard, isTeamMode, exitVideoPlaying]);

  useEffect(() => {
    if (step !== 'result' || !isActive) return;
    if (isTeamMode) {
      const timeoutId = setTimeout(handleContinue, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [step, isActive, mode, handleContinue, isTeamMode]);

  const handleKeyDown = useCallback((e: KeyboardEvent): boolean => {
    const isEnter = e.key === 'Enter' || e.code === 'NumpadEnter';
    const isZero = e.key === '0' || e.code === 'Numpad0';

    if (trialVideoStatus === 'playing') {
      if (isEnter || isZero) { e.preventDefault(); setTrialVideoStatus('done'); }
      return true; 
    }

    if (isEnter || isZero) {
      e.preventDefault();
      handleContinue();
    } else {
      e.preventDefault();
    }
    return true;
  }, [handleContinue, trialVideoStatus]);

  useKeyRouterLayer(KEY_LAYERS.OVERLAY, handleKeyDown, step === 'result' && isActive, useCallback((e: KeyboardEvent) => { e.preventDefault(); return true; }, []));

  useEffect(() => {
    if (step === 'result' && mode === 'trials' && revealedCard && !autoTriggeredRef.current && trialVideoStatus === 'done') {
      const tType = revealedCard.content.trialType;
      const targetMode: RandomizerMode | null = tType ? (modeMap[tType] || null) : null; 
      if (targetMode) {
        autoTriggeredRef.current = true;
        setTimeout(() => {
          if (!isClosingRef.current) {
            let extra: RandomizerExtraProps | undefined;
            if (targetMode === 'boss') {
              extra = { bossHealth: revealedCard.content.bossHealth ?? 200, bossId: revealedCard.itemIdentifier as number };
            } else if (typeof revealedCard.content.bossHealth === 'number') {
              extra = revealedCard.content.bossHealth;
            }
            onSubMode?.(targetMode, extra);
          }
        }, 1500); 
      }
    }
  }, [step, mode, revealedCard, onSubMode, trialVideoStatus]);

  const getCardImageUrl = (cardContent: Card['content']) => {
    if (!cardContent) return '';
    switch (cardContent.type) {
        case 'player': return cardContent.player ? `/heads/${cardContent.player.color}.png` : '';
        case 'wager': return cardContent.wagerImage || '';
        case 'prize': return cardContent.prizeImage || '';
        default: return '';
    }
  };

  const vsImageAnimationProps = { initial: { opacity: 0, scale: 0.5 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.5 }, transition: { delay: 0.3 } };

  return (
    <motion.div
      className="card-randomizer-overlay"
      initial={{ opacity: 0 }}
      animate={isClosing ? { opacity: 0 } : { opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={step === 'result' && trialVideoStatus !== 'playing' ? handleContinue : undefined}
    >
      <RandomizerBackground mode={mode} />
      <DojoBonusSidebar step={step} mode={mode} revealedCard={revealedCard} gameState={gameState} />

      <motion.div
        className={`card-randomizer-content ${isTeamMode ? 'team-mode' : ''}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={isClosing ? { scale: 0.8, opacity: 0 } : { scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="cards-container">
          {cards.map((card, renderedIndex) => {
            let targetX = 0, targetY = 0, targetRotate = 0, targetScale = 1;

            if (step === 'shuffle') {
              targetX = card.shufflePosition.x; targetY = card.shufflePosition.y; targetRotate = card.shufflePosition.rotate;
            } else if (step === 'deck') {
              targetX = renderedIndex * 1.5 - (cards.length * 0.75); targetY = renderedIndex * -1.5;
            } else if (step === 'flip' || step === 'result') {
              if (card.isTop) {
                targetScale = 1.05;
                const centerOffset = topCardCount === 4 ? 1.5 : (topCardCount === 3 ? 1 : 0);
                if (isTeamMode) targetX = (card.topIndex - centerOffset) * cardSpacing;
              } else {
                targetX = renderedIndex * 1.5 - (cards.length * 0.75); targetY = 100 + renderedIndex * -1.5;
              }
            }

            return (
              <motion.div
                key={card.id} className={`card-wrapper ${card.faceUp ? 'face-up' : 'face-down'}`}
                initial={{ opacity: 0, x: 0, y: 0, rotate: 0 }}
                animate={{ opacity: 1, x: targetX, y: targetY, rotate: targetRotate, scale: targetScale }}
                transition={{ type: 'spring', damping: 14, stiffness: 100, duration: step === 'shuffle' ? 0.8 : 0.5 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <div className="card-inner">
                  <div className={`card-face card-back mode-${mode}`}>
                    <img src={ASSETS.IMAGES.CARD_BACK} alt="Card Back" />
                  </div>
                  <div
                    className={`card-face card-front mode-${mode}`}
                    style={{ backgroundImage: `url(${getCardImageUrl(card.content)})` }}
                  >
                  </div>
                </div>
              </motion.div>
            );
          })}
          
          <AnimatePresence>
            {step === 'result' && (
              <>
                {mode === 'tourny' && <motion.img src={ASSETS.IMAGES.VS} alt="vs" className="vs-image vs-image-12" {...vsImageAnimationProps} />}
                {mode === '2v2' && <motion.img src={ASSETS.IMAGES.VS} alt="vs" className="vs-image vs-image-23" {...vsImageAnimationProps} />}
                {mode === '2v1' && <motion.img src={ASSETS.IMAGES.VS} alt="vs" className="vs-image vs-image-2v1" {...vsImageAnimationProps} />}                  
                {mode === '3v1' && <motion.img src={ASSETS.IMAGES.VS} alt="vs" className="vs-image vs-image-34" {...vsImageAnimationProps} />}
                {mode === 'tourny' && <motion.img src={ASSETS.IMAGES.VS} alt="vs" className="vs-image vs-image-34" {...vsImageAnimationProps} />}
              </>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {revealedCard && (
            <motion.div
              className={`result-image-container ${mode === 'trials' ? 'trials' : 'values'} mode-${mode}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <img
                src={getCardImageUrl(revealedCard.content)}
                alt="Revealed Card"
                className={`${mode === 'trials' ? 'result-image-trials' : 'result-image-values'} result-mode-${mode}`}
              /> 
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>          
          {step === 'result' && !['2v2', '3v1', 'tourny', '2v1'].includes(mode) && trialVideoStatus !== 'playing' && !exitVideoPlaying && (
            <motion.div
              className="continue-prompt"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              Press <span className="key-highlight">0</span> or <span className="key-highlight">Enter</span> to continue
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Trial Example Image Overlay - Mirrored Minimized TeamView Layout */}
      <AnimatePresence>
        {exampleImage && (
          <motion.img
            src={exampleImage}
            alt="Trial Example"
            className="trial-example-image"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        )}
      </AnimatePresence>

      <TrialVideoOverlay step={step} mode={mode} itemIdentifier={revealedCard?.itemIdentifier} status={trialVideoStatus} setStatus={setTrialVideoStatus} />
      
      <AnimatePresence>
        {exitVideoPlaying && (mode === 'prize-green' || mode === 'prize-red') && (
          <motion.div
            className="prize-exit-video-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => {
              e.stopPropagation();
              handleContinue(); 
            }}
          >
            <video
              src={mode === 'prize-green' ? `/prize-green/${GREEN_VIDEOS[greenPrizeVideoIndex]}` : `/prize-red/${RED_VIDEOS[redPrizeVideoIndex]}`}
              autoPlay
              playsInline
              className="prize-exit-video"
              onEnded={() => handleContinue()}
              onError={() => handleContinue()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

