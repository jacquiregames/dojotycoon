// src/config/investments.ts
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