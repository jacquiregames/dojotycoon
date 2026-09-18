// src/types.ts
export type DojoName = 'Combat' | 'Shuriken' | 'Stealth' | 'Disguise' | 'Climbing' | 'Arcane' | 'Ninja Stuff';

export const DOJO_NAMES: DojoName[] = [
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

export type RandomizerMode = 'wager' | '2v2' | '2v1' | '3v1' | 'prize-green' | 'prize-red' | 'tourny' | 'player-draw' | 'trials' | 'keno' | 'roulette' | 'boss' | 'evenoddboss' | 'jackpot';

export type RandomizerExtraProps =
  | { roundNumber?: number; bossHealth?: number; bossId?: string | number }
  | number;

export type RandomizerResult =
  | { type: 'team'; mode: '2v2' | '2v1' | '3v1' | 'tourny'; players: Player[] }
  | { type: 'minigame'; mode: 'keno' | 'roulette'; selectedNumbers: number[] }
  | { type: 'single'; mode: RandomizerMode; identifier?: string | number };

export type DiceImage = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | '2d6' | '3d6' | '5d6' | 'd412' | 'd620' | 'd820' | 'dq' | 'dall';

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