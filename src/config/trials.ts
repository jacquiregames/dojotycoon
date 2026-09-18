// src/config/trials.ts
import { DOJO_NAMES } from '../types';
import type { DojoName, DiceImage } from '../types';
import { DOJO_BONUSES } from './trialBonuses';

const RAW_BOSS_DATA: Record<string, string[]> = {  
  B1: ['d12', 'd20', 'Combat', 'boss', '145', '200'],
  B2: ['5d6', 'Shuriken', 'boss', '135', '180'],
  B3: ['d6', 'd12', 'Stealth', 'boss', '80', '100'],
  B4: ['d6', 'd10', 'Disguise', 'boss', '72', '100'],
  B5: ['d8', 'd10', 'd12', 'Climbing', 'boss', '135', '180'],
  B6: ['d4', 'Arcane', 'boss', '16', '20'],
  B7: ['2d6', 'Ninja Stuff', 'boss', '55', '70'],
  B8: ['d12', 'd10', 'Combat', 'evenoddboss', '45', '60'],
  B9: ['3d6', 'Shuriken', 'evenoddboss', '35', '50'],
  B10: ['d6', 'd12', 'Stealth', 'evenoddboss', '35', '50'],
  B11: ['d6', 'd10', 'Disguise', 'evenoddboss', '32', '45'],
  B12: ['d8', 'd10', 'd12', 'Climbing', 'evenoddboss', '65', '85'],
  B13: ['d8', 'Arcane', 'evenoddboss', '16', '22'],
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
26: ['4p','d20', 'Combat', 'tournament'],
27: ['4p','2d6', 'Shuriken', 'tournament'],
28: ['4p','d20', 'Stealth', 'tournament'],
29: ['4p','d20', 'Disguise', 'tournament'],
30: ['4p','d20', 'Climbing', 'tournament'],
31: ['4p','d20', 'Arcane', 'tournament'],
32: ['4p','d6', 'd20', 'Combat', '3v1'],
33: ['4p','d6', '3d6', 'Shuriken', '3v1'],
34: ['4p','d6', 'd12', 'Stealth', '3v1'],
35: ['4p','d4', 'd12', 'Disguise', '3v1'],
36: ['4p','d4', 'd10', 'Climbing', '3v1'],
37: ['4p','dall', 'Arcane', '3v1'],
38: ['4p','5d6', 'Combat', 'gauntlet'],
39: ['4p','5d6', 'Shuriken', 'gauntlet'],
40: ['4p','3d6', 'Stealth', 'gauntlet'],
41: ['4p','3d6', 'Disguise', 'gauntlet'],
42: ['4p','d20', 'Climbing', 'gauntlet'],
43: ['4p','d20', 'Arcane', 'gauntlet'],
44: ['both','dall', 'Disguise', 'ladder'],
45: ['both','dall', 'Shuriken', 'ladder'],
46: ['both','d10', 'dq', 'Ninja Stuff', 'themed'],
47: ['both','5d6', 'Ninja Stuff', 'themed'],
48: ['4p','5d6', 'Ninja Stuff', 'tournament'],
49: ['both','5d6', 'Ninja Stuff', 'themed'],
50: ['both','d12', 'Ninja Stuff', 'roulette'],
51: ['both','d412', 'Ninja Stuff', 'keno'],
52: ['both','dall', 'Ninja Stuff', 'themed'],
53: ['both','d20', 'Ninja Stuff', 'jackpot'],
54: ['both','3d6', 'Ninja Stuff', 'themed'],
55: ['both','2d6', 'Disguise', 'themed'],
56: ['both','d620', 'Ninja Stuff', 'themed'],
57: ['3p','d4','d6','d20', 'Combat', '2v1'],
58: ['3p','d10', 'd20', 'Shuriken', '2v1'],
59: ['3p','d4', 'd8', 'Stealth', '2v1'],
60: ['3p','d4', 'd8', 'Disguise', '2v1'],
61: ['3p','d4', 'd10', 'Climbing', '2v1'],
62: ['3p','d6', 'd12', 'Arcane', '2v1'],
63: ['3p','d6', '2d6', 'Ninja Stuff', '2v1'],
64: ['3p','5d6', 'Combat', 'gauntlet'],
65: ['3p','5d6', 'Shuriken', 'gauntlet'],
66: ['3p','3d6', 'Stealth', 'gauntlet'],
67: ['3p','3d6', 'Disguise', 'gauntlet'],
68: ['3p','d20', 'Climbing', 'gauntlet'],
69: ['3p','d20', 'Arcane', 'gauntlet'],
};

export const trialDiceData: Record<string | number, DiceImage[]> = {};

export const TRIAL_OPTIONS: Array<{
  id: string | number;
  value: string;
  image: string;
  dojo: DojoName;
  trialType: string;
  bossHealth3p?: number;
  bossHealth4p?: number;
  bonusText?: string;
}> = [];

function isDojoName(value: any): value is DojoName {
  return DOJO_NAMES.includes(value as DojoName);
}

// 1. Parse Standard Trials
Object.entries(RAW_TRIAL_DATA).forEach(([key, arr]) => {
  const id = parseInt(key, 10);
   
  const dojoIndex = arr.findIndex(item => isDojoName(item));
  if (dojoIndex !== -1) {
    const dice = arr.slice(1, dojoIndex) as DiceImage[];
    const dojo = arr[dojoIndex] as DojoName;  
    const trialType = arr[dojoIndex + 1];
    const bonusText = DOJO_BONUSES[id]?.[1];
 
    trialDiceData[id] = dice;
    TRIAL_OPTIONS.push({
      id,
      value: `Trial ${id}`,
      image: `/images/trials/slide${id}.png`,
      dojo,
      trialType,
      bonusText
    });
  }
});

// 2. Parse Boss Data
Object.entries(RAW_BOSS_DATA).forEach(([key, arr]) => {
  const dojoIndex = arr.findIndex(item => isDojoName(item));
  if (dojoIndex !== -1) {
    const dice = arr.slice(0, dojoIndex) as DiceImage[];
    const dojo = arr[dojoIndex] as DojoName;
    const trialType = arr[dojoIndex + 1];
    const bossHealth3p = parseInt(arr[dojoIndex + 2], 10);
    const bossHealth4p = parseInt(arr[dojoIndex + 3], 10);
    const bonusText = DOJO_BONUSES[key]?.[1];

    trialDiceData[key] = dice;
    TRIAL_OPTIONS.push({
      id: key,
      value: `Boss ${key}`,
      image: `/images/bosses/${key}.png`, 
      dojo,
      trialType,
      bossHealth3p,
      bossHealth4p, 
      bonusText
    });
  }
});