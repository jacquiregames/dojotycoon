import { useState, useEffect, useRef, useCallback, type CSSProperties } from "react";
import type { Player } from "../types";

import { ASSETS } from '../config/assets';
import { useKeyRouterLayer, KEY_LAYERS } from '../hooks/useKeyRouterLayer';
import "./LandingPage.css";

const colorOptions =[
  { name: "Red", id: "red", hex: "#ff0000" },
  { name: "Orange", id: "orange", hex: "#f97316" },
  { name: "Yellow", id: "yellow", hex: "#FFFF00" },
  { name: "Green", id: "green", hex: "#0fff50" },
  { name: "Blue", id: "blue", hex: "#0165FC" },
  { name: "Purple", id: "purple", hex: "#BF00FF" },
];

const initialPlayers: Player[] = Array.from({ length: 4 }, (_, index) => ({
  name: "",
  color: colorOptions[index % colorOptions.length].id,
}));

interface LandingPageProps {
  onStart: (players: Player[], totalRounds: number) => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [totalRounds, setTotalRounds] = useState<number>(15);
  const [playerCount, setPlayerCount] = useState<number>(4); // NEW
  const [showStartVideo, setShowStartVideo] = useState(false);
  const [showHowToPlayVideo, setShowHowToPlayVideo] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const howToPlayVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const audio = new Audio(ASSETS.MUSIC.INTRO);
    audio.loop = true;
    audioRef.current = audio;
    let hasStarted = false;

    const tryPlay = () => {
      if (hasStarted) return;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          hasStarted = true;
        }).catch(() => { /* block handled implicitly by user interaction events */ });
      } else {
        hasStarted = true; 
      }
    };

    tryPlay();

    const handleInteraction = () => {
      if (!hasStarted) tryPlay();
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      audio.pause();
      audio.currentTime = 0;
      audio.src = '';
    };
  }, []);
  
  const handleHowToPlayEnded = useCallback(() => {
    setShowHowToPlayVideo(false);
    if (howToPlayVideoRef.current) {
      howToPlayVideoRef.current.pause(); 
      howToPlayVideoRef.current.currentTime = 0; 
    }
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const handleHowToPlayClick = useCallback(() => {
    if (showStartVideo || showHowToPlayVideo) return; 
    
    if (audioRef.current) {
      audioRef.current.pause();
    }

    setShowHowToPlayVideo(true);
    if (howToPlayVideoRef.current) {
      howToPlayVideoRef.current.play().catch(e => console.warn("Video playback prevented:", e));
    }
  }, [showStartVideo, showHowToPlayVideo]);

  const handleStartClick = useCallback(() => {
    if (showStartVideo || showHowToPlayVideo) return; 
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    setShowStartVideo(true);
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.warn("Video playback prevented:", e));
    }

  }, [showStartVideo, showHowToPlayVideo]);

  // Routed through the same central key router every other overlay in the
  // app uses, so a future overlay layered on top of the landing screen
  // can't silently collide with this handler (see useKeyRouter.tsx).
  const handleKeyDown = useCallback((e: KeyboardEvent): boolean => {
    if (e.key !== 'Enter' && e.code !== 'NumpadEnter') return false;

    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return false;

    e.preventDefault();
    if (showHowToPlayVideo) {
      handleHowToPlayEnded();
    } else {
      handleStartClick();
    }
    return true;
  }, [showHowToPlayVideo, handleHowToPlayEnded, handleStartClick]);

  useKeyRouterLayer(KEY_LAYERS.BASE, handleKeyDown, true);

  function updatePlayerName(index: number, name: string) {
    setPlayers((currentPlayers) =>
      currentPlayers.map((player, playerIndex) =>
        playerIndex === index ? { ...player, name } : player
      )
    );
  }

  function updatePlayerColor(index: number, colorId: string) {
    setPlayers((currentPlayers) =>
      currentPlayers.map((player, playerIndex) =>
        playerIndex === index ? { ...player, color: colorId } : player
      )
    );
  }
 
  // ONLY render rows for the selected player count
  const activePlayers = players.slice(0, playerCount);

  return (
    <main className="app-shell">
      
      <button className="how-to-play-btn" onClick={handleHowToPlayClick} type="button">
        <img src="/buttons/HowToPlay.png" alt="How to Play" />
      </button>

      {!showStartVideo && !showHowToPlayVideo && (
        <div className="landing-loop-video-container">
          <video 
            src="/backgrounds/landing.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="landing-loop-video"
          />
        </div>
      )}

      <div className={`landing-video-overlay ${showStartVideo ? 'active' : ''}`}>
        <video 
          ref={videoRef} 
          src="/backgrounds/start.mp4" 
          playsInline 
          preload="auto" 
          className="landing-video" 
          onEnded={() => {
            // Slice the players array so the rest of the app only sees 3 players!
            onStart(players.slice(0, playerCount).map((p, i) => ({ ...p, name: p.name.trim() || `NINJA${i + 1}` })), totalRounds);
          }}
        />
      </div>

      <div 
        className={`landing-video-overlay ${showHowToPlayVideo ? 'active' : ''}`} 
        onClick={handleHowToPlayEnded} 
      >
        <video 
          ref={howToPlayVideoRef} 
          src="/videos/howtoplay.mp4" 
          playsInline 
          preload="auto" 
          className="landing-video" 
          onEnded={handleHowToPlayEnded}
        />
      </div>
      
      <section className="entry-card">
        <div className="content-area">
          <div className="player-list">
            {activePlayers.map((player, index) => (
              <div className="player-row" key={`player-${index + 1}`}>
                <div className="ninja-avatar-container" aria-hidden="true">
                  <img
                    src={`/heads/${player.color}.png`}
                    alt={`${player.color} ninja`}
                    className="ninja-avatar"
                  />
                </div>
                <label className="name-field">
                  <input
                    type="text"
                    value={player.name}
                    placeholder={`NINJA${index + 1}`}
                    maxLength={18}
                    onChange={(event) => updatePlayerName(index, event.target.value)}
                  />
                </label>

                <fieldset className="color-picker">
                  <div className="swatch-grid">
                    {colorOptions.map((color) => {
                      const selected = player.color === color.id;
                      const takenByOther = activePlayers.some((p, i) => i !== index && p.color === color.id);

                      return (
                        <button
                          className={`color-swatch${selected ? " selected" : ""}${takenByOther ? " taken" : ""}`}
                          key={color.id}
                          type="button"
                          aria-label={`Choose ${color.name} for Player ${index + 1}${takenByOther ? ' (already taken)' : ''}`}
                          aria-pressed={selected}
                          disabled={takenByOther}
                          onClick={() => updatePlayerColor(index, color.id)}
                          style={{ "--swatch-color": color.hex } as CSSProperties}
                        />
                      );
                    })}
                  </div>
                </fieldset>
              </div>
            ))}
          </div>

          <div className="start-actions">
            <div className="settings-columns">
              <div className="toggles-col">
                <button 
                  type="button"
                  className={`length-toggle ${playerCount === 3 ? 'selected' : ''}`}
                  onClick={() => setPlayerCount(3)}
                >
                  <img src="/buttons/3p.png" alt="3 Players" />
                </button>
                <button 
                  type="button"
                  className={`length-toggle ${playerCount === 4 ? 'selected' : ''}`}
                  onClick={() => setPlayerCount(4)}
                >
                  <img src="/buttons/4p.png" alt="4 Players" />
                </button>
              </div>
              <div className="toggles-col">
                <button 
                  type="button"
                  className={`length-toggle ${totalRounds === 10 ? 'selected' : ''}`}
                  onClick={() => setTotalRounds(10)}
                >
                  <img src="/buttons/10rounds.png" alt="10 Rounds" />
                </button>
                <button 
                  type="button"
                  className={`length-toggle ${totalRounds === 15 ? 'selected' : ''}`}
                  onClick={() => setTotalRounds(15)}
                >
                  <img src="/buttons/15rounds.png" alt="15 Rounds" />
                </button>
              </div>
            </div>
            <button 
              className="start-button" 
              type="button"  
              onClick={handleStartClick}
            >
              <img src="/buttons/startgame.png" alt="Start Game" />
            </button>

          </div>

        </div>
      </section>
    </main>
  );
}

