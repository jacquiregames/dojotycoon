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
  if (playerCount === 3 && totalRounds === 10) tierImageSrc = '/tier/300600.png';
  else if (playerCount === 3 && totalRounds === 15) tierImageSrc = '/tier/300800.png';
  else if (playerCount === 4 && totalRounds === 10) tierImageSrc = '/tier/400800.png';
  else if (playerCount === 4 && totalRounds === 15) tierImageSrc = '/tier/400990.png';

  return (
    <div className="global-controls-container">
      <div className="trials-container">
        <button className="global-control-button" disabled={isDisabled} onClick={(e) => { e.currentTarget.blur(); openRandomizer('trials', undefined, undefined, { roundNumber }); }}>
          <img src="/buttons/trials.png" alt="Shuffle Trials" className="main-btn-img" />
          <img src="/banners/plus.png" alt="Shortcut Plus" className="shortcut-badge" />
        </button>
        {tierImageSrc && <img src={tierImageSrc} alt="Tier Range Guide" className="tier-guide-image" />}
        <span className="round-text">{roundNumber > totalRounds ? 'GAME OVER' : `Round ${roundNumber}`}</span>
      </div>
      
      <button className="global-control-button" disabled={isDisabled} onClick={(e) => { e.currentTarget.blur(); openRandomizer('prize-green'); }}>
        <img src="/buttons/green.png" alt="Shuffle Green Prize" className="main-btn-img" />
        <img src="/banners/divide.png" alt="Shortcut Divide" className="shortcut-badge" />
      </button>

      <button className="global-control-button" disabled={isDisabled} onClick={(e) => { e.currentTarget.blur(); openRandomizer('prize-red'); }}>
        <img src="/buttons/red.png" alt="Shuffle Red Prize" className="main-btn-img" />
        <img src="/banners/mult.png" alt="Shortcut Multiply" className="shortcut-badge" />
      </button>

      <button className="global-control-button" disabled={isDisabled} onClick={(e) => { e.currentTarget.blur(); openRandomizer('wager'); }}>
        <img src="/buttons/wager.png" alt="Shuffle Wager" className="main-btn-img" />
        <img src="/banners/minus.png" alt="Shortcut Minus" className="shortcut-badge" />
      </button>
            
      <button className="global-control-button" onClick={openVampPopup}>
        <img src="/banners/one.png" className="shortcut-badge" alt="Shortcut 1" />
        <img src="/buttons/vampire.png" alt="Vampire" />
      </button>

      <button className="global-control-button" onClick={openBoardNinjaPopup}>
        <img src="/banners/three.png" className="shortcut-badge" alt="Shortcut 3" />
        <img src="/buttons/boardninja.png" alt="Board Ninja" />
      </button>

      <button className="global-control-button" onClick={openArguePopup}>
        <img src="/banners/5.png" className="shortcut-badge" alt="Shortcut 5" />
        <img src="/buttons/argue.png" alt="Argue" />
      </button>

      {roundNumber > totalRounds && (
        <button className="global-control-button" onClick={(e) => { e.currentTarget.blur(); setShowOuttakes(true); }}>
          <img src="/buttons/outtakes.png" alt="Play Outtakes" className="main-btn-img" />
        </button>
      )}
    </div>
  );
}

