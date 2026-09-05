import { useCallback, useEffect, useMemo, useState } from "react";
import { useKeyRouterLayer, KEY_LAYERS } from '../hooks/useKeyRouterLayer';
import "./TeamView.css";
import type { Player } from "../types";

type GameMode = "2v2" | "2v1" | "3v1" | "tourny";

const colorToLetter: Record<string, string> = {
  red: "r",
  orange: "o",
  yellow: "y",
  green: "g",
  blue: "b",
  purple: "p",
};

interface TeamViewProps {
  selected: Player[];
  mode: GameMode;
  onClose: () => void;
  autoMinimize?: boolean;
  onMinimize?: () => void;
}

export default function TeamView({ selected, mode, onClose, autoMinimize, onMinimize }: TeamViewProps) {
  const [isReady, setIsReady] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Minimize the TeamView automatically after 5 seconds if we were auto-triggered
  useEffect(() => {
    if (isReady && autoMinimize && !isMinimized) {
      const timer = setTimeout(() => {
        setIsMinimized(true);
        if (onMinimize) onMinimize(); // ALERT PARENT
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isReady, autoMinimize, isMinimized, onMinimize]);

  // Self-contained keyboard logic
  const handleKeyDown = useCallback((e: KeyboardEvent): boolean => {
    e.preventDefault();
    if (e.key === '0' || e.code === 'Numpad0') {
      if (autoMinimize) {
        setIsMinimized(true);
        if (onMinimize) onMinimize(); // ALERT PARENT
      } else {
        onClose(); // Standalone team view, close directly
      }
    }
    return true;
  }, [onClose, autoMinimize, onMinimize]);

  const handleKeyUp = useCallback((e: KeyboardEvent): boolean => {
    e.preventDefault();
    return true;
  }, []);

  useKeyRouterLayer(KEY_LAYERS.OVERLAY, handleKeyDown, !isMinimized, handleKeyUp);

  const { leftTeamImages, rightTeamImages } = useMemo(() => {
    const requiredCount = mode === "2v1" ? 3 : 4;
    if (selected.length < requiredCount) {
      return { leftTeamImages: [], rightTeamImages: [] };
    }

    if (mode === "tourny") {
      const tP1 = selected[0];
      const tP2 = selected[1];
      const tP3 = selected[2];
      const tP4 = selected[3];
      return {
        leftTeamImages: [
          { src: `/ninjas/1p/${colorToLetter[tP1.color]}3.png`, alt: "Player 1", className: "tourny-p1" },
          { src: `/ninjas/1p/${colorToLetter[tP3.color]}3.png`, alt: "Player 3", className: "tourny-p3" },
        ],
        rightTeamImages: [
          { src: `/ninjas/1p/${colorToLetter[tP2.color]}3.png`, alt: "Player 2", className: "tourny-p2" },
          { src: `/ninjas/1p/${colorToLetter[tP4.color]}3.png`, alt: "Player 4", className: "tourny-p4" },
        ],
      };
    }

    if (mode === "3v1") {
      const team1 = selected.slice(0, 3);
      const team2 = selected.slice(3, 4);
      return {
        leftTeamImages: [
          {
            src: `/ninjas/1p/${colorToLetter[team1[0].color]}1.png`,
            alt: "Team 1 Player 1",
            className: "team3v1-p1",
          },
          {
            src: `/ninjas/1p/${colorToLetter[team1[1].color]}2.png`,
            alt: "Team 1 Player 2",
            className: "team3v1-p2",
          },
          {
            src: `/ninjas/1p/${colorToLetter[team1[2].color]}3.png`,
            alt: "Team 1 Player 3",
            className: "team3v1-p3",
          },
        ],
        rightTeamImages: [
          {
            src: `/ninjas/1p/${colorToLetter[team2[0].color]}1.png`,
            alt: "Team 2 Player 4",
            className: "team3v1-p4",
          },
        ],
      };
    }

    if (mode === "2v1") {
      const team1 = selected.slice(0, 2);
      const team2 = selected.slice(2, 3);
      return {
        leftTeamImages: [
          { src: `/ninjas/1p/${colorToLetter[team1[0].color]}1.png`, alt: "Team 1 Player 1", className: "team-p1-front" },
          { src: `/ninjas/1p/${colorToLetter[team1[1].color]}2.png`, alt: "Team 1 Player 2", className: "team-p2-behind" },
        ],
        rightTeamImages: [
          { src: `/ninjas/1p/${colorToLetter[team2[0].color]}1.png`, alt: "Team 2 Player 3", className: "team-p4-front" },
        ],
      };
    }

    // Default to 2v2
    const team1 = selected.slice(0, 2);
    const team2 = selected.slice(2, 4);
    return {
      leftTeamImages: [
        { src: `/ninjas/1p/${colorToLetter[team1[0].color]}1.png`, alt: `Player 1`, className: "team-p1-front" },
        { src: `/ninjas/1p/${colorToLetter[team1[1].color]}2.png`, alt: `Player 2`, className: "team-p2-behind" },
      ],
      rightTeamImages: [
        { src: `/ninjas/1p/${colorToLetter[team2[0].color]}2.png`, alt: `Player 3`, className: "team-p3-behind" },
        { src: `/ninjas/1p/${colorToLetter[team2[1].color]}1.png`, alt: `Player 4`, className: "team-p4-front" },
      ],
    };
  }, [selected, mode]);

  return (
    <div className={`team-view-overlay ${isMinimized ? 'minimized' : ''}`} onClick={isMinimized ? undefined : onClose}>
      <div className={`vs-container ${isReady ? "show" : ""} ${mode === "3v1" ? "mode-3v1" : ""} ${mode === "tourny" ? "mode-tourny" : ""}`}>
        
        <video autoPlay loop muted playsInline className="team-view-bg-video">
          <source src="/backgrounds/teamview.mp4" type="video/mp4" />
        </video>

        <div className="team-display left">
          {leftTeamImages.map(
            (img) =>
              img.src && (
                <img
                  key={img.src}
                  src={img.src}
                  alt={img.alt}
                  className={img.className}
                />
              )
          )}
        </div>

        <div className={`vs ${mode === "3v1" ? "vs-3v1" : ""} ${mode === "2v1" ? "vs-2v1" : ""} ${mode === "tourny" ? "vs-tourny" : ""}`}>
          {mode === "tourny" ? (
            <>
              <img src="/vs.png" alt="vs" className="tourny-vs1" />
              <img src="/vs.png" alt="vs" className="tourny-vs2" />
            </>
          ) : (
            <img src="/vs.png" alt="vs" /> 
          )}
        </div>

        <div className="team-display right">
          {rightTeamImages.map(
            (img) =>
              img.src && (
                <img
                  key={img.src}
                  src={img.src}
                  alt={img.alt}
                  className={img.className}
                />
              )
          )}
        </div>
      </div>
    </div>
  );
}


