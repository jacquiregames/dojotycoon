import { DOJO_NAMES } from '../types';
import type { DojoName } from '../types';

export const MAX_INVESTMENT_BY_CONFIG: Record<3 | 4, Record<10 | 15, number>> = {
  3: { 10: 600, 15: 800 },
  4: { 10: 800, 15: 990 },
};

export const GAME_CONFIG = {
  MAX_INVESTMENT: 990,
};

 
export const TIER_THRESHOLDS = {
  TIER_1: 10,
  TIER_2: 100,
} as const;

 
export function getMaxInvestment(playerCount: number, totalRounds: number): number {
  const byPlayerCount = MAX_INVESTMENT_BY_CONFIG[playerCount as 3 | 4];
  return byPlayerCount?.[totalRounds as 10 | 15] ?? GAME_CONFIG.MAX_INVESTMENT;
}

export const WAGER_OPTIONS = [ 
  { value: '$30', image: '/wager/30d.webp' },
  { value: '$50', image: '/wager/50d.webp' },
  { value: '50%', image: '/wager/50p.webp' },
  { value: '$100', image: '/wager/100d.webp' }, 
  { value: '100%', image: '/wager/100p.webp' },
  { value: '$150', image: '/wager/150d.webp' }, 
  { value: '$200', image: '/wager/200d.webp' }, 
  { value: '1 Honor', image: '/wager/1honor.webp' },
];

export const GREEN_PRIZE_OPTIONS = [
  { value: '+$30', image: '/prize-green/plus30d.png' },
  { value: '+$50', image: '/prize-green/plus50d.png' },
  { value: '+50%', image: '/prize-green/plus50p.png' },
  { value: '+$100', image: '/prize-green/plus100d.png' },
  { value: '+100%', image: '/prize-green/plus100p.png' }, 
  { value: '+$150', image: '/prize-green/plus150d.png' },
  { value: '+$200', image: '/prize-green/plus200d.png' },
  { value: '+1 Honor', image: '/prize-green/plus1honor.png' },
];

export const RED_PRIZE_OPTIONS = [ 
  { value: '-$30', image: '/prize-red/minus30d.png' },
  { value: '-$50', image: '/prize-red/minus50d.png' },
  { value: '-50%', image: '/prize-red/minus50p.png' },
  { value: '-$100', image: '/prize-red/minus100d.png' },
  { value: '-100%', image: '/prize-red/minus100p.png' },
  { value: '-$150', image: '/prize-red/minus150d.png' },
  { value: '-$200', image: '/prize-red/minus200d.png' },
];

export type DiceImage = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | '2d6' | '3d6' | '5d6' | 'd412' | 'd620' | 'd820' | 'dq' | 'dall';

export const ROUND_TRIAL_MAP_15R_3P: Record<number, number[]> = {
  1: [52,53,55,58,59,60,61,62], //ninja stuff
  2: [1,2,3,4,5,6], //f4ah
  3: [44,45,46,47,48,49], //gauntlet
  4: [63,64,65,66,67,68,69], //2v1
  5: [70,71,72,73,74,75], //boss
  6: [52,53,55,58,59,60,61,62], //ninja stuff
  7: [20,21,22,23,24,25], //race
  8: [7,8,9,10,11,12], //f4al
  9: [56,57], //keno-roulette
  10: [70,71,72,73,74,75], //boss
  11: [1,2,3,4,5,6], //f4ah
  12: [50,51], //ladder
  13: [63,64,65,66,67,68,69], //2v1
  14: [44,45,46,47,48,49], //gauntlet
  15: [52,53,55,58,59,60,61,62], //ninja stuff
};
export const ROUND_TRIAL_MAP_10R_3P: Record<number, number[]> = { 
  1: [52,53,55,58,59,60,61,62], //ninja stuff
  2: [1,2,3,4,5,6], //f4ah
  3: [56,57],  //keno-roulette
  4: [44,45,46,47,48,49], //gauntlet
  5: [70,71,72,73,74,75], //boss
  6: [63,64,65,66,67,68,69], //2v1
  7: [20,21,22,23,24,25], //race
  8: [50,51], //ladder
  9: [7,8,9,10,11,12], //f4al
  10: [52,53,55,58,59,60,61,62], //ninja stuff
};
export const ROUND_TRIAL_MAP_15R_4P: Record<number, number[]> = {
  1: [13,14,15,16,17,18,19], //2v2
  2: [1,2,3,4,5,6], //f4ah
  3: [32,33,34,35,36,37], //tourny
  4: [44,45,46,47,48,49], //gauntlet
  5: [26,27,28,29,30,31], //boss
  6: [38,39,40,41,42,43], //3v1
  7: [20,21,22,23,24,25], //race
  8: [50,51], //ladder
  9: [7,8,9,10,11,12], //f4al
  10: [26,27,28,29,30,31], //boss
  11: [56,57], //keno-roulette
  12: [13,14,15,16,17,18,19], //2v2
  13: [52,53,54,55,58,59,60,61,62], //ninja stuff
  14: [52,53,54,55,58,59,60,61,62], //ninja stuff
  15: [32,33,34,35,36,37] //tourny
};
export const ROUND_TRIAL_MAP_10R_4P: Record<number, number[]> = { 
  1: [13,14,15,16,17,18,19], //2v2 
  2: [1,2,3,4,5,6,7,8,9,10,11,12], //f4ah & f4al
  3: [56,57],  //keno-roulette
  4: [44,45,46,47,48,49], //gauntlet
  5: [26,27,28,29,30,31], //boss
  6: [38,39,40,41,42,43], //3v1
  7: [20,21,22,23,24,25], //race
  8: [50,51], //ladder
  9: [32,33,34,35,36,37], //tourny
  10: [52,53,54,55,58,59,60,61,62], //ninja stuff
};

const RAW_TRIAL_DATA: Record<number, string[]> = {  
  1: ['both','d20', 'Combat', 'f4ah'],
  2: ['both','5d6', 'Shuriken', 'f4ah'],
  3: ['both','d12', 'Stealth', 'f4ah'],
  4: ['both','d10', 'Disguise', 'f4ah'],
  5: ['both','d8', 'Climbing', 'f4ah'],
  6: ['both','d4', 'Arcane', 'f4ah'],
  7: ['both','d20', 'Combat', 'f4al'],
  8: ['both','3d6', 'Shuriken', 'f4al'],
  9: ['both','d12', 'Stealth', 'f4al'],
  10: ['both','d10', 'Disguise', 'f4al'],
  11: ['both','d8', 'Climbing', 'f4al'],
  12: ['both','d4', 'Arcane', 'f4al'],
  13: ['4p','d20', 'Combat', '2v2'],
  14: ['4p','5d6', 'Shuriken', '2v2'],
  15: ['4p','d6', 'Stealth', '2v2'],
  16: ['4p','d10', 'Disguise', '2v2'],
  17: ['4p','d8', 'Climbing', '2v2'],
  18: ['4p','d4', 'Arcane', '2v2'],
  19: ['4p','d6', 'Ninja Stuff', '2v2'],
  20: ['both','dall', 'Combat', 'race'],
  21: ['both','dall', 'Shuriken', 'race'],
  22: ['both','dall', 'Stealth', 'race'],
  23: ['both','dall', 'Disguise', 'race'],
  24: ['both','dall', 'Climbing', 'race'],
  25: ['both','dall', 'Arcane', 'race'],
  26: ['4p','d20', 'd12', 'Combat', 'boss', '200'],
  27: ['4p','5d6', 'Shuriken', 'boss', '200'],
  28: ['4p','d12', 'd6', 'Stealth', 'boss', '100'],
  29: ['4p','d10', 'd6', 'Disguise', 'boss', '100'],
  30: ['4p','d8', 'd10', 'd12', 'Climbing', 'boss', '150'],
  31: ['4p','d4', 'Arcane', 'boss', '20'],
  32: ['4p','d20', 'Combat', 'tournament'],
  33: ['4p','2d6', 'Shuriken', 'tournament'],
  34: ['4p','d20', 'Stealth', 'tournament'],
  35: ['4p','d20', 'Disguise', 'tournament'],
  36: ['4p','d20', 'Climbing', 'tournament'],
  37: ['4p','d20', 'Arcane', 'tournament'],
  38: ['4p','d6', 'd20', 'Combat', '3v1'],
  39: ['4p','d6', '3d6', 'Shuriken', '3v1'],
  40: ['4p','d6', 'd12', 'Stealth', '3v1'],
  41: ['4p','d4', 'd12', 'Disguise', '3v1'],
  42: ['4p','d4', 'd10', 'Climbing', '3v1'],
  43: ['4p','dall', 'Arcane', '3v1'],
  44: ['both','5d6', 'Combat', 'gauntlet'],
  45: ['both','5d6', 'Shuriken', 'gauntlet'],
  46: ['both','3d6', 'Stealth', 'gauntlet'],
  47: ['both','3d6', 'Disguise', 'gauntlet'],
  48: ['both','d20', 'Climbing', 'gauntlet'],
  49: ['both','d20', 'Arcane', 'gauntlet'],
  50: ['both','dall', 'Disguise', 'ladder'],
  51: ['both','dall', 'Shuriken', 'ladder'],
  52: ['both','d10', 'dq', 'Ninja Stuff', 'themed'],
  53: ['both','5d6', 'Ninja Stuff', 'themed'],
  54: ['4p','5d6', 'Ninja Stuff', 'tournament'],
  55: ['both','5d6', 'Ninja Stuff', 'themed'],
  56: ['both','d12', 'Ninja Stuff', 'roulette'],
  57: ['both','d412', 'Ninja Stuff', 'keno'],
  58: ['both','dall', 'Ninja Stuff', 'themed'],
  59: ['both','d20', 'Ninja Stuff', 'jackpot'],
  60: ['both','3d6', 'Ninja Stuff', 'themed'],
  61: ['both','2d6', 'Disguise', 'themed'],
  62: ['both','d620', 'Ninja Stuff', 'themed'],
  63: ['3p','d4','d6','d20', 'Combat', '2v1'],
  64: ['3p','d10', 'd20', 'Shuriken', '2v1'],
  65: ['3p','d4', 'd8', 'Stealth', '2v1'],
  66: ['3p','d4', 'd8', 'Disguise', '2v1'],
  67: ['3p','d4', 'd10', 'Climbing', '2v1'],
  68: ['3p','d6', 'd12', 'Arcane', '2v1'],
  69: ['3p','d6', '2d6', 'Ninja Stuff', '2v1'], 
  70: ['3p','d20', 'd12', 'Combat', 'boss', '160'],
  71: ['3p','5d6', 'Shuriken', 'boss', '140'],
  72: ['3p','d12', 'd6', 'Stealth', 'boss', '90'],
  73: ['3p','d10', 'd6', 'Disguise', 'boss', '80'],
  74: ['3p','d8', 'd10', 'd12', 'Climbing', 'boss', '130'],
  75: ['3p','d4', 'Arcane', 'boss', '18'],
}; 
 
export const trialDiceData: Record<number, DiceImage[]> = {};

export const TRIAL_OPTIONS: Array<{
  id: number;
  value: string;
  image: string;
  dojo: DojoName;
  trialType: string;
  bossHealth?: number;
}> = [];

// Type-guard for DojoName
function isDojoName(value: any): value is DojoName {
  return DOJO_NAMES.includes(value as DojoName);
}
 
Object.entries(RAW_TRIAL_DATA).forEach(([key, arr]) => {
  const id = parseInt(key, 10);
   
  const dojoIndex = arr.findIndex(item => isDojoName(item));
  
  if (dojoIndex !== -1) {
    const dice = arr.slice(1, dojoIndex) as DiceImage[];
    const dojo = arr[dojoIndex];  
    if (!isDojoName(dojo)) {
      console.error(`Invalid Dojo name found in trial data for ID ${id}: ${dojo}`);
      return; 
    }

    const trialType = arr[dojoIndex + 1];
    const bossHealthStr = arr[dojoIndex + 2];
    const bossHealth = bossHealthStr ? parseInt(bossHealthStr, 10) : undefined;
 
    trialDiceData[id] = dice;
    TRIAL_OPTIONS.push({
      id,
      value: `Trial ${id}`,
      image: `/trials/slide${id}.png`,
      dojo,
      trialType,
      bossHealth
    });
  }
});
