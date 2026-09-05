// src/components/ProgressiveJackpot.tsx
import React, { useRef, useState, useCallback, useEffect } from "react";
import { useKeyRouterLayer, KEY_LAYERS } from "../hooks/useKeyRouterLayer";
import "./ProgressiveJackpot.css";

type FlyItem = { id: number; value: number; startX: number; startY: number; dx: number; dy: number; };
type Coin = { id: number; startX: number; startY: number; cx: number; cy: number; };
type Spark = { id: number; x: number; y: number; sx: number; sy: number; };

const START = 100;
const MAX = 999;
const COUNT_UP_DURATION = 700;

interface ProgressiveJackpotProps {
  onClose: () => void;
  isActive: boolean;
}

export default function ProgressiveJackpot({ onClose, isActive }: ProgressiveJackpotProps) {
  const [total, setTotal] = useState<number>(START);
  const [displayTotal, setDisplayTotal] = useState<number>(START);
  const [buffer, setBuffer] = useState<string>("");
  const [bump, setBump] = useState<boolean>(false);
  const [maxFlash, setMaxFlash] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);
  const [invalid, setInvalid] = useState<boolean>(false);
  
  const [flying, setFlying] = useState<FlyItem[]>([]);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [sparks, setSparks] = useState<Spark[]>([]);

  const totalRef = useRef<HTMLSpanElement | null>(null);
  const displayRef = useRef<HTMLDivElement | null>(null);
  const idCounter = useRef(0);
  const countUpRaf = useRef<number | null>(null);
  const runningTotalRef = useRef<number>(START);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Wraps setTimeout so every timeout this component schedules gets
  // cancelled on unmount (see the cleanup effect below) instead of firing
  // late and calling setState on an unmounted component.
  const trackTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
      if (countUpRaf.current) cancelAnimationFrame(countUpRaf.current);
    };
  }, []);

  const triggerCountUp = useCallback((from: number, to: number) => {
    if (countUpRaf.current) cancelAnimationFrame(countUpRaf.current);
    const start = performance.now();
    const diff = to - from;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / COUNT_UP_DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(from + diff * eased);
      setDisplayTotal(val);
      if (t < 1) {
        countUpRaf.current = requestAnimationFrame(tick);
      } else {
        setDisplayTotal(to);
        countUpRaf.current = null;
      }
    };
    countUpRaf.current = requestAnimationFrame(tick);
  }, []);

  const spawnCoins = useCallback((sx: number, sy: number, tx: number, ty: number) => {
    const newCoins: Coin[] = [];
    const newSparks: Spark[] = [];
    for (let i = 0; i < 12; i++) {
      idCounter.current += 1;
      newCoins.push({
        id: idCounter.current,
        startX: sx + (Math.random() - 0.5) * 40,
        startY: sy + (Math.random() - 0.5) * 40,
        cx: tx - sx + (Math.random() - 0.5) * 30,
        cy: ty - sy + (Math.random() - 0.5) * 30,
      });
    }
    for (let i = 0; i < 14; i++) {
      idCounter.current += 1;
      const angle = (i / 14) * Math.PI * 2;
      const dist = 60 + Math.random() * 60;
      newSparks.push({
        id: idCounter.current,
        x: tx,
        y: ty,
        sx: Math.cos(angle) * dist,
        sy: Math.sin(angle) * dist,
      });
    }
    setCoins((c) => [...c, ...newCoins]);
    setSparks((s) => [...s, ...newSparks]);
    trackTimeout(() => {
      setCoins((c) => c.filter((x) => !newCoins.find((n) => n.id === x.id)));
    }, 1100);
    trackTimeout(() => {
      setSparks((s) => s.filter((x) => !newSparks.find((n) => n.id === x.id)));
    }, 800);
  }, [trackTimeout]);

  const submitBuffer = useCallback(() => {
    if (!buffer) return;
    const num = parseInt(buffer, 10);
    if (isNaN(num) || num <= 0) {
      setBuffer("");
      setInvalid(true);
      trackTimeout(() => setInvalid(false), 400);
      return;
    }
    const currentTotal = runningTotalRef.current;
    if (currentTotal >= MAX) {
      setBuffer("");
      setMaxFlash(true);
      trackTimeout(() => setMaxFlash(false), 600);
      return;
    }
    let newTotal = currentTotal + num;
    if (newTotal > MAX) newTotal = MAX;
    const actualAdded = newTotal - currentTotal;
    runningTotalRef.current = newTotal; // reserved immediately so a rapid second submit stacks correctly

    const displayRect = displayRef.current?.getBoundingClientRect();
    const targetX = displayRect ? displayRect.left + displayRect.width / 2 : window.innerWidth - 200;
    const targetY = displayRect ? displayRect.top + displayRect.height / 2 : 120;
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;

    idCounter.current += 1;
    const flyItem: FlyItem = {
      id: idCounter.current,
      value: actualAdded,
      startX,
      startY,
      dx: targetX - startX,
      dy: targetY - startY,
    };
    setFlying((f) => [...f, flyItem]);

    trackTimeout(() => {
      setFlying((f) => f.filter((x) => x.id !== flyItem.id));
      setTotal(runningTotalRef.current);
      setBump(true);
      setShake(true);
      spawnCoins(targetX, targetY, targetX, targetY);
      triggerCountUp(currentTotal, newTotal);
      trackTimeout(() => setBump(false), 400);
      trackTimeout(() => setShake(false), 400);
      if (newTotal >= MAX) {
        trackTimeout(() => {
          setMaxFlash(true);
          trackTimeout(() => setMaxFlash(false), 600);
        }, COUNT_UP_DURATION);
      }
    }, 850);

    setBuffer("");
  }, [buffer, spawnCoins, triggerCountUp, trackTimeout]);

  // Integrated Key Router
  const handleKeyDown = useCallback((e: KeyboardEvent): boolean => {
    const key = e.key;
    const code = e.code;

    // Numpad Close (specifically the minus key)
    if (key === '-' || code === 'NumpadSubtract') {
      e.preventDefault();
      onClose();
      return true;
    }

    // Submit
    if (key === "Enter" || code === "NumpadEnter") {
      e.preventDefault();
      submitBuffer();
      return true;
    }

    // Delete Last Character
    if (key === "Backspace") {
      e.preventDefault();
      setBuffer((b) => b.slice(0, -1));
      return true;
    }

    // Clear All
    if (key === "Escape" || key === "Delete") {
      e.preventDefault();
      setBuffer("");
      return true;
    }

    // Number Entry (Capped at 2 characters so max addition is 99)
    let digit: string | null = null;
    if (key >= '0' && key <= '9') {
      digit = key;
    } else if (code && code.startsWith('Numpad') && code.length === 7) {
      const num = code[6];
      if (num >= '0' && num <= '9') digit = num;
    }

    if (digit !== null) {
      e.preventDefault();
      setBuffer((b) => {
        if (b.length >= 2) return b; // Restricts to max 99
        const next = (b + digit).replace(/^0+/, "");
        return next.slice(0, 2); 
      });
      return true;
    }

    // Important: return false for unhandled keys so we don't block normal browser functions!
    return false; 
  }, [submitBuffer, onClose]);

  const handleKeyUp = useCallback((_e: KeyboardEvent): boolean => {
    // Only trap keyUp if we actually care about it, otherwise let it pass
    return false;
  }, []);

  useKeyRouterLayer(KEY_LAYERS.OVERLAY, handleKeyDown, isActive, handleKeyUp);

  const formattedTotal = displayTotal.toString().padStart(3, "0");

  return (
    <div className="jackpot-overlay">
      <div className={`modal ${shake ? "shake" : ""} ${invalid ? "invalid" : ""}`}>
        <div className="bulbs" />
        <div className="modal-inner">
          <div className="header"> 
            <div className="title"> ★ Progressive Jackpot ★ </div>
          </div>
          <div className="display" ref={displayRef}>
            <span className="dollar-sign">$</span>
            <span
              ref={totalRef}
              className={`total ${bump ? "bump" : ""} ${maxFlash ? "max-flash" : ""}`}
            >
              {formattedTotal}
            </span>
            <div className="max-label">
              {total >= MAX ? "★ MAX JACKPOT ★" : `Max $${MAX}`}
            </div>
          </div>

          <div className="input-pill">
            <div className="input-label">Add Dice Roll</div>
            <div className={`input-value ${buffer ? "" : "empty"}`}>
              {buffer || "__"}
              <span className="caret" />
            </div>
          </div>
        </div>
      </div>

      {flying.map((f) => (
        <div key={f.id} className="fly" style={{ left: `${f.startX}px`, top: `${f.startY}px`, ["--dx" as string]: `${f.dx}px`, ["--dy" as string]: `${f.dy}px` } as React.CSSProperties}>
          +{f.value}
        </div>
      ))}

      {coins.map((c) => (
        <div key={c.id} className="coin" style={{ left: `${c.startX}px`, top: `${c.startY}px`, ["--cx" as string]: `${c.cx}px`, ["--cy" as string]: `${c.cy}px` } as React.CSSProperties} />
      ))}

      {sparks.map((s) => (
        <div key={s.id} className="spark" style={{ left: `${s.x}px`, top: `${s.y}px`, ["--sx" as string]: `${s.sx}px`, ["--sy" as string]: `${s.sy}px` } as React.CSSProperties} />
      ))}
    </div>
  );
}


