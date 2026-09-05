import type { RandomizerMode } from '../types';
import { ASSETS } from '../config/assets';

interface RandomizerBackgroundProps {
  mode: RandomizerMode;
}

export default function RandomizerBackground({ mode }: RandomizerBackgroundProps) {
  if (mode === 'wager') {
    return (
      <>
        <video src={ASSETS.VIDEOS.WAGER_BG} autoPlay loop muted playsInline className="card-randomizer-bg-video" /> 
        <img src={ASSETS.IMAGES.WAGER_RULES} alt="Wager Rules" className="card-randomizer-rules-overlay" />
      </>
    );
  }
  if (mode === 'prize-green') {
    return <video src={ASSETS.VIDEOS.PRIZE_GREEN_BG} autoPlay loop muted playsInline className="card-randomizer-bg-video" />;
  }
  if (mode === 'prize-red') {
    return <video src={ASSETS.VIDEOS.PRIZE_RED_BG} autoPlay loop muted playsInline className="card-randomizer-bg-video" />;
  }
  return null;
}

