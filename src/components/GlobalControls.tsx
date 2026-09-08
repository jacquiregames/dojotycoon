import { useCallback } from 'react';
import type { Player, RandomizerMode, RandomizerExtraProps } from '../types';

interface GlobalControlsProps { 
  roundNumber: number;
  totalRounds: number;
  playerCount: number;
  isChangingRound: boolean;
  openRandomizer: (mode: RandomizerMode, players?: Player[], clickedIndex?: number, extraProps?: RandomizerExtraProps) => void;
  openVampPopup: () => void;
  openBoardNinjaPopup: () => void;
  openArguePopup: () => void; 
  setShowOuttakes: (show: boolean) => void;
}
 
export default function GlobalControls({
  roundNumber, totalRounds, playerCount, isChangingRound, openRandomizer,
  openVampPopup, openBoardNinjaPopup, openArguePopup, setShowOuttakes,
}: GlobalControlsProps) {

  const isDisabled = roundNumber > totalRounds || isChangingRound;

  let tierImageSrc = '';
  if (playerCount === 3 && totalRounds === 10) tierImageSrc = '/images/tier/300600.png';
  else if (playerCount === 3 && totalRounds === 15) tierImageSrc = '/images/tier/300800.png';
  else if (playerCount === 4 && totalRounds === 10) tierImageSrc = '/images/tier/400800.png';
  else if (playerCount === 4 && totalRounds === 15) tierImageSrc = '/images/tier/400990.png';
 
  const handleTrialsClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    openRandomizer('trials', undefined, undefined, { roundNumber });
  }, [openRandomizer, roundNumber]);

  const handleGreenClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    openRandomizer('prize-green');
  }, [openRandomizer]);

  const handleRedClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    openRandomizer('prize-red');
  }, [openRandomizer]);

  const handleWagerClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    openRandomizer('wager');
  }, [openRandomizer]);

  const handleOuttakesClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    setShowOuttakes(true);
  }, [setShowOuttakes]);

  return (
    <div className="global-controls-container">
      <div className="trials-container">
        <button className="global-control-button" disabled={isDisabled} onClick={handleTrialsClick}>
          <img src="/images/buttons/trials.png" alt="Shuffle Trials" className="main-btn-img" />
          <img src="/images/banners/plus.png" alt="Shortcut Plus" className="shortcut-badge" />
        </button>
        {tierImageSrc && <img src={tierImageSrc} alt="Tier Range Guide" className="tier-guide-image" />}
        <span className="round-text">{roundNumber > totalRounds ? 'GAME OVER' : `Round ${roundNumber}`}</span>
      </div>
      
      <button className="global-control-button" disabled={isDisabled} onClick={handleGreenClick}>
        <img src="/images/buttons/green.png" alt="Shuffle Green Prize" className="main-btn-img" />
        <img src="/images/banners/divide.png" alt="Shortcut Divide" className="shortcut-badge" />
      </button>

      <button className="global-control-button" disabled={isDisabled} onClick={handleRedClick}>
        <img src="/images/buttons/red.png" alt="Shuffle Red Prize" className="main-btn-img" />
        <img src="/images/banners/mult.png" alt="Shortcut Multiply" className="shortcut-badge" />
      </button>

      <button className="global-control-button" disabled={isDisabled} onClick={handleWagerClick}>
        <img src="/images/buttons/wager.png" alt="Shuffle Wager" className="main-btn-img" />
        <img src="/images/banners/minus.png" alt="Shortcut Minus" className="shortcut-badge" />
      </button>
            
      <button className="global-control-button" onClick={openVampPopup}>
        <img src="/images/banners/one.png" className="shortcut-badge" alt="Shortcut 1" />
        <img src="/images/buttons/vampire.png" alt="Vampire" />
      </button>

      <button className="global-control-button" onClick={openBoardNinjaPopup}>
        <img src="/images/banners/three.png" className="shortcut-badge" alt="Shortcut 3" />
        <img src="/images/buttons/boardninja.png" alt="Board Ninja" />
      </button>

      <button className="global-control-button" onClick={openArguePopup}>
        <img src="/images/banners/5.png" className="shortcut-badge" alt="Shortcut 5" />
        <img src="/images/buttons/argue.png" alt="Argue" />
      </button>

      {roundNumber > totalRounds && (
        <button className="global-control-button" onClick={handleOuttakesClick}>
          <img src="/images/buttons/outtakes.png" alt="Play Outtakes" className="main-btn-img" />
        </button>
      )}
    </div>
  );
}
