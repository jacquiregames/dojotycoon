export type DojoName = 'Combat' | 'Shuriken' | 'Stealth' | 'Disguise' | 'Climbing' | 'Arcane' | 'Ninja Stuff';

export const DOJO_NAMES: DojoName[] =[
  'Combat',
  'Shuriken',
  'Stealth',
  'Disguise',
  'Climbing',
  'Arcane',
  'Ninja Stuff'
];
 
export interface Player {
  name: string;
  color: string;
}

export interface GameState {
  players: Player[]; 
  dojoTiers: Record<DojoName, number>;
  investments: Record<DojoName, number[]>; 
  majorityInvestors: Record<DojoName, number>;
}

export type FocusType = 'tier' | 'investment' | 'header';

export interface FocusCell {
  dojoIndex: number;
  type: FocusType;
  playerIndex?: number; 
}

export type RandomizerMode = 'wager' | '2v2' | '2v1' | '3v1' | 'prize-green' | 'prize-red' | 'tourny' | 'player-draw' | 'trials' | 'keno' | 'roulette' | 'boss' | 'jackpot';

// The "extra data" a randomizer step can be opened with. In practice this is
// either the round number a trial-draw should filter by, the boss config a
// trial handed off to BossDamageTracker, or (for non-boss sub-modes
// auto-triggered from a trial card) a bare number that downstream code
// ignores. See CardRandomizer's post-trial auto-trigger effect.
export type RandomizerExtraProps =
  | { roundNumber?: number; bossHealth?: number; bossId?: number }
  | number;

// The result a randomizer overlay reports back through onClose() once the
// player has seen the outcome. `undefined` means "closed without a result"
// (e.g. a plain team reveal being dismissed).
export type RandomizerResult =
  | { type: 'team'; mode: '2v2' | '2v1' | '3v1' | 'tourny'; players: Player[] }
  | { type: 'minigame'; mode: 'keno' | 'roulette'; selectedNumbers: number[] }
  | { type: 'single'; mode: RandomizerMode; identifier?: string | number };

export const PLAYER_COLOR_MAP: Record<string, string> = {
  red: '#ff0000',
  orange: '#f97316',
  yellow: '#FFFF00',
  green: '#0fff50',
  blue: '#0165FC',
  purple: '#BF00FF',
};

export const DOJO_COLOR_MAP: Record<DojoName, string> = {
  'Combat': '#ff0000',
  'Shuriken': '#ff8c00',
  'Stealth': '#0066ff',
  'Disguise': '#ffff00',
  'Climbing': '#00ff00',
  'Arcane': '#bf00ff',
  'Ninja Stuff': '#00ffff'
};

