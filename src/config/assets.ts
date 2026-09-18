// src/config/assets.ts
 
export const getFinalBossHealth = (playerCount: number) => (playerCount >= 4 ? 80 : 60);

export const ASSETS = {
  MUSIC: {
    GAMEOVER: '/music/gameover.mp3',
    ARGUE: '/music/argue.mp3',
    VAMP_RULES: '/music/vamprules.mp3',
    NINJA_RULES: '/music/ninjarules.mp3',
    INTRO: '/music/intro.mp3',
    BOSS_INTRO: '/music/bossintro.mp3',
    FINAL_BOSS: '/music/finalboss.mp3',
    TOASTY: '/music/toasty.mp3',  
  },
  VIDEOS: {
    FINALE_16: '/videos/rounds/16.mp4',
    OUTTAKES: '/videos/outtakes.mp4',
    HOW_TO_PLAY: '/videos/howtoplay.mp4',
    LANDING_LOOP: '/videos/landing.mp4',
    START: '/videos/backgrounds/start.mp4',
    TEAM_VIEW_BG: '/videos/backgrounds/teamview.mp4',
    WAGER_BG: '/videos/backgrounds/wager.mp4',
    PRIZE_GREEN_BG: '/videos/backgrounds/prize-green.mp4',
    PRIZE_RED_BG: '/videos/backgrounds/prize-red.mp4',
  },
  IMAGES: {
    COINS_OVERLAY: '/videos/rounds/coins.png',
    VS: '/images/ninjas/vs.png',
    CARD_BACK: '/images/heads/cardback.png',
    WAGER_RULES: '/images/backgrounds/wager_rules.png',
    NINJA_RULES_BG: '/images/backgrounds/ninjarules.png',
    ARGUE_BG: '/images/backgrounds/argue.png',
  },
  
  // Dynamic path getters
  getRoundVideo: (round: number) => `/videos/rounds/${round}.mp4`,
  getTrialMusic: (round: number) => `/music/rounds/${round}.mp3`,
  getRandomizerMusic: (mode: string) => `/music/${mode}.mp3`,
  getBossVideo: (id: string | number) => `/videos/bosses/${id}.mp4`,
  getTrialVideo: (id: string | number) => `/videos/trialvideos/${id}.mp4`,
};