// src/components/RoundChange.tsx
import React, { useState, useCallback, useEffect, useRef } from "react";
import "./RoundChange.css";
 
interface RoundChangeProps {
  currentRound: number;
  totalRounds: number;
  onComplete: () => void;
}

export default function RoundChange({ currentRound, totalRounds, onComplete }: RoundChangeProps) {
  const [displayRound, setDisplayRound] = useState(currentRound);
  const [animState, setAnimState] = useState<"idle" | "out" | "in">("idle");
  const [isGameOver, setIsGameOver] = useState(false);
  const [shake, setShake] = useState(false);
  const [ringBurst, setRingBurst] = useState(false);
  const [streaks, setStreaks] = useState<{ id: number; top: number; color: string }[]>([]);
  const streakIdRef = useRef(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const nextRound = currentRound + 1;  
  const isFinale = currentRound === totalRounds;
  
  // Track which transition animation to use based on the starting round
  const transitionNumRef = useRef(currentRound);

  const triggerStreaks = useCallback(() => {
    const colors = ["#6366f1", "#a5b4fc", "#e0e7ff", "#f472b6", "#22d3ee"];
    const newStreaks = Array.from({ length: 12 }).map(() => ({
      id: streakIdRef.current++,
      top: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    
    setStreaks((prev) => [...prev, ...newStreaks]);
    
    // Remove streaks after animation
    setTimeout(() => {
      setStreaks([]);
    }, 500);
  }, []);

  // Attempt to play the video forcefully if React's autoPlay prop hits a browser quirk
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(e => {
        console.warn("Video autoplay prevented by browser policies:", e);
      });
    }
  }, []);

  useEffect(() => {
    // Stage 1: Text Animations (If it's not the finale)
    let t1: ReturnType<typeof setTimeout>;
    if (!isFinale) {
      t1 = setTimeout(() => {
        setShake(true);
        setRingBurst(true);
        triggerStreaks();
        
        setTimeout(() => setShake(false), 400);
        setTimeout(() => setRingBurst(false), 800);

        setAnimState("out");

        setTimeout(() => {
          if (currentRound >= totalRounds) {
            setIsGameOver(true);
          } else {
            setDisplayRound(currentRound + 1);
          }
          setAnimState("in");

          setTimeout(() => {
            setAnimState("idle");
          }, 500);
        }, 350);
      }, 1500);
    }

    // Fallback: if the round/finale video fails to load or stalls, force
    // this overlay closed anyway rather than blocking the game forever.
    // 19s was chosen to comfortably outlast the longest round video plus
    // the ~1.5s text-transition lead-in above, with headroom to spare -
    // bump this if a future round video runs longer than that.
    const fallback = setTimeout(() => {
      onComplete();
    }, 19000);

    return () => {
      if (t1) clearTimeout(t1);
      clearTimeout(fallback);
    };
  }, [currentRound, isFinale, onComplete, triggerStreaks, totalRounds]);

  const getAnimClass = () => {
    if (animState === "out") {
      if (isGameOver) return "animating-out game-over-out";
      const t = transitionNumRef.current;
      return `round-out-${t}`;
    }
    if (animState === "in") {
      if (isGameOver) return "animating-in game-over-in";
      const t = transitionNumRef.current;
      return `round-in-${t}`;
    }
    return "";
  };

  return (
    <div className="round-change-overlay">

      {/* Coins APNG: Mid-game transition (Round 9->10 for 15-round, Round 4->5 for 10-round) */}
      {((currentRound === 10 && totalRounds === 15) || (currentRound === 5 && totalRounds === 10)) && (
        <img 
          src="/videos/coins.png" 
          alt="Coins Overlay" 
          className="coins-overlay" 
        />
      )}
      {isFinale ? (
        <video
          ref={videoRef}
          src={`/videos/16.mp4`} // Force Game Over video for both 10 and 15 round games
          autoPlay
          playsInline
          className="finale-video"
          onEnded={onComplete}
        />
      ) : (
        <div className={`round-change-container ${shake && !isGameOver ? "warp-shake" : ""}`}>
          
          {/* Background floating particles */}
          <div className="bg-particles">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  width: `${2 + Math.random() * 4}px`,
                  height: `${2 + Math.random() * 4}px`,
                  background: `rgba(${99 + Math.random() * 60}, ${102 + Math.random() * 30}, ${241 - Math.random() * 40}, ${0.3 + Math.random() * 0.4})`,
                  animationDuration: `${8 + Math.random() * 16}s`,
                  animationDelay: `${Math.random() * 12}s`,
                }}
              />
            ))}
          </div>

          {/* Main display */}
          <div className="display-wrapper">
            <div className={`glow-ring ${ringBurst ? "burst" : ""}`} />

            {/* Hyperdrive Light Streaks */}
            <div className="streaks-container">
              {streaks.map((streak) => (
                <div
                  key={streak.id}
                  className="light-streak"
                  style={{
                    top: `${streak.top}%`,
                    width: `${100 + Math.random() * 200}px`,
                    "--streak-color": streak.color,
                  } as React.CSSProperties}
                />
              ))}
            </div>

            {/* Text */}
            <div className={getAnimClass()}>
              <div className={`round-number ${isGameOver ? "game-over" : ""}`}>
                {isGameOver ? "" : `Round ${displayRound}`}
              </div>
            </div>

            {/* Video Player Container */}
            {nextRound <= totalRounds && (
              <div className="video-container">
                <video
                  ref={videoRef}
                  src={`/videos/${nextRound}.mp4`}
                  autoPlay
                  playsInline
                  className="round-video"
                  onEnded={onComplete}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

