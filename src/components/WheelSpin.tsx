import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { useKeyRouterLayer, KEY_LAYERS } from "../hooks/useKeyRouterLayer";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import "./WheelSpin.css";

type Wedge = {
  id: number;
  name: string;
  label: string;
  desc: string;
  color: string;
  neon: string;
  icon: string;
  centerAngle: number;
};

const STEP = 360 / 7;

const WEDGES: Wedge[] = [
  { id: 0, name: "Shuriken", label: "Shuriken", desc: "Master thrown weapons — precision strikes from the shadows.", color: "#ff5a00", neon: "#ff9d00", icon: "✴️", centerAngle: 334.286 },
  { id: 1, name: "Combat", label: "Combat", desc: "Kendo and close-quarters — overwhelm foes with aggressive offense.", color: "#ff0000", neon: "#ff073a", icon: "⚔️", centerAngle: 25.714 },
  { id: 2, name: "Disguise", label: "Disguise", desc: "Infiltrate in plain sight — the yellow suit is just business.", color: "#ffff00", neon: "#ffe14d", icon: "🕵️", centerAngle: 77.143 },
  { id: 3, name: "Climbing", label: "Climbing", desc: "Scale walls and cliffs — mobility opens forbidden paths.", color: "#00ff00", neon: "#39ff14", icon: "🧗", centerAngle: 128.571 },
  { id: 4, name: "Stealth", label: "Stealth", desc: "Move unseen in bamboo — ghost steps and silent takedowns.", color: "#2323ff", neon: "#1f51ff", icon: "🌿", centerAngle: 180.0 },
  { id: 5, name: "Arcane", label: "Arcane", desc: "Channel chakra vortex — mystic energy for reality-bending jutsu.", color: "#9500ff", neon: "#7f007f", icon: "🔮", centerAngle: 231.429 },
  { id: 6, name: "Ninja Stuff", label: "Ninja Stuff", desc: "Gadgets, rides and drip — SHINOBI-licensed gear.", color: "#22d3ee", neon: "#67e8f9", icon: "🚗", centerAngle: 282.857 },
];
 
function squareEdgePoint(angleDeg: number) {
  const rad = (angleDeg - 90) * Math.PI / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  const scale = 50 / Math.max(Math.abs(dx), Math.abs(dy));
  return { x: 50 + dx * scale, y: 50 + dy * scale };
}

function normalizeAngle(angle: number) {
  return ((angle % 360) + 360) % 360;
}

function angleInRange(angle: number, start: number, end: number) {
  angle = normalizeAngle(angle);
  start = normalizeAngle(start);
  end = normalizeAngle(end);
  if (start <= end) return angle >= start && angle <= end;
  return angle >= start || angle <= end;
}

function buildSquareWedgePoints(centerAngle: number) {
  const start = centerAngle - STEP / 2;
  const end = centerAngle + STEP / 2;
  const points: { x: number; y: number; angle: number }[] = [];

  const adjustUpperRight = (angle: number) => {
    const normalized = normalizeAngle(angle);
    if (Math.abs(normalized - 45) < 0.01) return angle + 8;
    if (Math.abs(normalized - 315) < 0.01) return angle - 8;
    return angle;
  };

  const adjustedStart = adjustUpperRight(start);
  points.push({ ...squareEdgePoint(adjustedStart), angle: normalizeAngle(adjustedStart) });

  const corners = [
    { x: 100, y: 0, angle: 45 },
    { x: 100, y: 100, angle: 135 },
    { x: 0, y: 100, angle: 225 },
    { x: 0, y: 0, angle: 315 },
  ];

  for (const corner of corners) {
    if (angleInRange(corner.angle, start, end)) points.push(corner);
  }

  const adjustedEnd = adjustUpperRight(end);
  points.push({ ...squareEdgePoint(adjustedEnd), angle: normalizeAngle(adjustedEnd) });

  points.sort((a, b) => {
    const aOffset = (a.angle - normalizeAngle(start) + 360) % 360;
    const bOffset = (b.angle - normalizeAngle(start) + 360) % 360;
    return aOffset - bOffset;
  });

  return points;
}
 
function buildClipPolygon(centerAngle: number) {
  const points = buildSquareWedgePoints(centerAngle);
  return `polygon(50% 50%, ${points.map((p) => `${p.x.toFixed(3)}% ${p.y.toFixed(3)}%`).join(", ")})`;
}

function buildSvgPath(centerAngle: number) {
  const points = buildSquareWedgePoints(centerAngle);
  return ["M 50 50", ...points.map((p) => `L ${p.x.toFixed(3)} ${p.y.toFixed(3)}`), "Z"].join(" ");
} 

interface WheelSpinProps {
  onContinue: () => void;
}

export default function WheelSpin({ onContinue }: WheelSpinProps) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const rotationRef = useRef(0);
  const hasSpun = useRef(false);

  const clips = useMemo(() => WEDGES.map((w) => buildClipPolygon(w.centerAngle)), []);
  const paths = useMemo(() => WEDGES.map((w) => buildSvgPath(w.centerAngle)), []);

  const prefersReducedMotion = usePrefersReducedMotion();

  const spin = useCallback(() => {
    if (spinning) return;
    const winner = Math.floor(Math.random() * 7);
    const targetAngle = WEDGES[winner].centerAngle;
    
    const jitter = (Math.random() - 0.5) * (STEP * 0.52);
    const target = targetAngle + jitter;

    const currentMod = ((rotationRef.current % 360) + 360) % 360;
    const deltaToTarget = (target - currentMod + 360) % 360;
    const fullSpins = 6 + Math.floor(Math.random() * 3); 
    const newRotation = rotationRef.current + fullSpins * 360 + deltaToTarget;

    rotationRef.current = newRotation;
    setRotation(newRotation);

    if (prefersReducedMotion) {
      // Skip the multi-second spin animation entirely: land on the result
      // immediately rather than forcing several seconds of motion on
      // someone who's asked the OS to reduce it.
      setSelected(winner);
      return;
    }

    setSpinning(true);
    setSelected(null);

    setTimeout(() => {
      setSelected(winner);
      setSpinning(false);
    }, 4200);
  }, [spinning, prefersReducedMotion]);

  // Auto trigger spin on mount exactly once
  useEffect(() => {
    if (!hasSpun.current) {
      hasSpun.current = true;
      spin();
    }
  }, [spin]);

  // Register keyboard shortcut to progress to the game
  const handleKeyDown = useCallback((e: KeyboardEvent): boolean => {
    if ((e.key === 'Enter' || e.code === 'NumpadEnter') && !spinning && selected !== null) {
      e.preventDefault();
      onContinue();
      return true;
    }
    return false;
  }, [spinning, selected, onContinue]);

  useKeyRouterLayer(KEY_LAYERS.BASE, handleKeyDown, !spinning && selected !== null);

  return (
    <div className="wheel-spin-wrapper">
      <div className="wheel-stage">
        <div className="wheel">
          {WEDGES.map((w, i) => {
            const isDimmed = selected !== null && selected !== i;
            const isWinner = selected === i;
            return (
              <div
                key={w.id}
                className={`wedge-dim ${isDimmed ? "dimmed" : ""} ${isWinner ? "winner" : ""}`}
                style={{ clipPath: clips[i] }}
              />
            );
          })}

          <svg className="wedge-borders" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="0.8" floodColor="white" floodOpacity="0.9" />
                <feGaussianBlur stdDeviation="1.2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="neon-glow-strong" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="2.2" result="blur1" />
                <feGaussianBlur stdDeviation="5" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur2" />
                  <feMergeNode in="blur1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {paths.map((d, i) => (
              <path key={`base-${i}`} d={d} className="base-stroke" />
            ))}

            {WEDGES.map((w, i) => (
              <path
                key={`neon-strong-${i}`}
                d={paths[i]}
                className={`neon-stroke strong-glow ${selected === i ? "show neon-pulse" : ""}`}
                style={{ stroke: w.neon } as React.CSSProperties}
              />
            ))}
            {WEDGES.map((w, i) => (
              <path
                key={`neon-${i}`}
                d={paths[i]}
                className={`neon-stroke glow ${selected === i ? "show" : ""}`}
                style={{ stroke: w.neon, strokeWidth: selected === i ? 2.2 : 0 } as React.CSSProperties}
              />
            ))}
          </svg>

          <div
            className={`arrow-rig ${spinning ? "spinning" : ""}`}
            style={{
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              transition: spinning ? "transform 4.2s cubic-bezier(0.18, 0.84, 0.22, 1)" : "none",
              top: "50%",
              left: "50%",
              position: "absolute",
            }}
          >
            <div className="arrow-needle">
              <div className="arrow-head" />
              <div className="arrow-shaft" />
              <div className="arrow-base" />
            </div>
          </div>
        </div>
      </div>

      <div className="controls">
        <button 
          className="continue-btn" 
          onClick={spinning || selected === null ? undefined : onContinue}
          style={{ opacity: spinning || selected === null ? 0 : 1, pointerEvents: spinning || selected === null ? 'none' : 'auto' }}
        >
          <img src="/buttons/continue.png" alt="Continue" />
        </button>
      </div>
    </div>
  );
}

