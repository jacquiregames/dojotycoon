import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { useMediaPopup } from '../hooks/useMediaPopup';
import { ASSETS } from '../config/assets';

const VAMP_VIDEOS = ['vamprules1.mp4', 'vamprules2.mp4', 'vamprules3.mp4', 'vamprules4.mp4', 'vamprules5.mp4'];
const BOARD_NINJA_VIDEOS = ['ninjarules1.mp4', 'ninjarules2.mp4', 'ninjarules3.mp4', 'ninjarules4.mp4'];
const ARGUE_VIDEOS = ['argue1.mp4', 'argue2.mp4', 'argue3.mp4', 'argue4.mp4', 'argue5.mp4'];

export interface RulesPopupsHandle {
  openVamp: () => void;
  openBoardNinja: () => void;
  openArgue: () => void;
}

interface RulesPopupsProps {
  playerCount: number;
}

const RulesPopups = forwardRef<RulesPopupsHandle, RulesPopupsProps>(({ playerCount }, ref) => {
  const vampVideoRef = useRef<HTMLVideoElement>(null);
  const boardNinjaVideoRef = useRef<HTMLVideoElement>(null);
  const argueVideoRef = useRef<HTMLVideoElement>(null);

  const [vampVideoIndex, setVampVideoIndex] = useState(0);
  const [boardNinjaVideoIndex, setBoardNinjaVideoIndex] = useState(0);
  const [argueVideoIndex, setArgueVideoIndex] = useState(0);

  const handleVampClose = useCallback(() => setVampVideoIndex((prev) => (prev + 1) % VAMP_VIDEOS.length), []);
  const handleBoardNinjaClose = useCallback(() => setBoardNinjaVideoIndex((prev) => (prev + 1) % BOARD_NINJA_VIDEOS.length), []);
  const handleArgueClose = useCallback(() => setArgueVideoIndex((prev) => (prev + 1) % ARGUE_VIDEOS.length), []);

  const vampPopup = useMediaPopup('image-first', handleVampClose);
  const boardNinjaPopup = useMediaPopup('image-first', handleBoardNinjaClose);
  const arguePopup = useMediaPopup('image-first', handleArgueClose);

  useImperativeHandle(ref, () => ({
    openVamp: () => vampPopup.setState('image'),
    openBoardNinja: () => boardNinjaPopup.setState('image'),
    openArgue: () => arguePopup.setState('image'),
  }));

  // Play Argue music
  useEffect(() => {
    let argueAudio: HTMLAudioElement | null = null;
    if (arguePopup.state === 'image') {
      argueAudio = new Audio(ASSETS.MUSIC.ARGUE);
      argueAudio.loop = true;
      const playPromise = argueAudio.play();
      if (playPromise !== undefined) playPromise.catch(() => {});
    }
    return () => {
      if (argueAudio) {
        argueAudio.pause();
        argueAudio.currentTime = 0;
        argueAudio.src = '';
      }
    };
  }, [arguePopup.state]);

  // Play Vampire music
  useEffect(() => {
    let vampAudio: HTMLAudioElement | null = null;
    if (vampPopup.state === 'image') {
      vampAudio = new Audio(ASSETS.MUSIC.VAMP_RULES);
      vampAudio.loop = true;
      const playPromise = vampAudio.play();
      if (playPromise !== undefined) playPromise.catch(() => {});
    }
    return () => {
      if (vampAudio) {
        vampAudio.pause();
        vampAudio.currentTime = 0;
        vampAudio.src = '';
      }
    };
  }, [vampPopup.state]);

  // Play Board Ninja music
  useEffect(() => {
    let ninjaAudio: HTMLAudioElement | null = null;
    if (boardNinjaPopup.state === 'image') {
      ninjaAudio = new Audio(ASSETS.MUSIC.NINJA_RULES);
      ninjaAudio.loop = true;
      const playPromise = ninjaAudio.play();
      if (playPromise !== undefined) playPromise.catch(() => {});
    }
    return () => {
      if (ninjaAudio) {
        ninjaAudio.pause();
        ninjaAudio.currentTime = 0;
        ninjaAudio.src = '';
      }
    };
  }, [boardNinjaPopup.state]);

  useEffect(() => {
    const vampEl = vampVideoRef.current;
    const ninjaEl = boardNinjaVideoRef.current;
    const argueEl = argueVideoRef.current;

    return () => {
      [vampEl, ninjaEl, argueEl].forEach(el => {
        if (el) {
          el.pause();
          el.removeAttribute('src');
          el.load();
        }
      });
    };
  }, [vampPopup.state, boardNinjaPopup.state, arguePopup.state]);

  return (
    <>
      {/* Conditionally mounting <video> tags fully removes them from memory decoding slots */}
      {vampPopup.state !== 'hidden' && (
        <div className="vamp-overlay" onClick={vampPopup.advance}>
          {vampPopup.state === 'image' && (
            <img src={`/vamprules/vamprules${playerCount}p.png`} alt="Vampire Intro" className="vamp-media" />
          )}
          {vampPopup.state === 'video' && (
            <video
              ref={vampVideoRef}
              src={`/vamprules/${VAMP_VIDEOS[vampVideoIndex]}`}
              autoPlay playsInline preload="auto"
              className="vamp-media"
              onEnded={() => { vampPopup.setState('hidden'); handleVampClose(); }}
              onError={() => { vampPopup.setState('hidden'); handleVampClose(); }}
            />
          )}
        </div>
      )}

      {boardNinjaPopup.state !== 'hidden' && (
        <div className="vamp-overlay" onClick={boardNinjaPopup.advance}>
          {boardNinjaPopup.state === 'image' && (
            <img src={ASSETS.IMAGES.NINJA_RULES_BG} alt="Board Ninja Intro" className="vamp-media" />
          )}
          {boardNinjaPopup.state === 'video' && (
            <video
              ref={boardNinjaVideoRef}
              src={`/ninjarules/${BOARD_NINJA_VIDEOS[boardNinjaVideoIndex]}`}
              autoPlay playsInline preload="auto"
              className="vamp-media"
              onEnded={() => { boardNinjaPopup.setState('hidden'); handleBoardNinjaClose(); }}
              onError={() => { boardNinjaPopup.setState('hidden'); handleBoardNinjaClose(); }} 
            />
          )}
        </div>
      )}

      {arguePopup.state !== 'hidden' && (
        <div className="vamp-overlay" onClick={arguePopup.advance}>
          {arguePopup.state === 'image' && (
            <img src={ASSETS.IMAGES.ARGUE_BG} alt="Argue Intro" className="vamp-media" />
          )}
          {arguePopup.state === 'video' && (
            <video
              ref={argueVideoRef}
              src={`/argue/${ARGUE_VIDEOS[argueVideoIndex]}`}
              autoPlay playsInline preload="auto"
              className="vamp-media"
              onEnded={() => { arguePopup.setState('hidden'); handleArgueClose(); }}
              onError={() => { arguePopup.setState('hidden'); handleArgueClose(); }}
            />
          )}
        </div>
      )}
    </>
  );
});

RulesPopups.displayName = 'RulesPopups';
export default RulesPopups;

