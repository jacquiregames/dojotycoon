// src/config/assets.ts

export const ASSETS = {
  MUSIC: {
    GAMEOVER: '/music/gameover.mp3',
    ARGUE: '/music/argue.mp3',
    VAMP_RULES: '/music/vamprules.mp3',
    NINJA_RULES: '/music/ninjarules.mp3',
    INTRO: '/music/intro.mp3',
    BOSS_INTRO: '/bosses/bossintro.mp3',
  },
  VIDEOS: {
    FINALE_16: '/videos/16.mp4',
    OUTTAKES: '/videos/outtakes.mp4',
    HOW_TO_PLAY: '/videos/howtoplay.mp4',
    LANDING_LOOP: '/backgrounds/landing.mp4',
    START: '/backgrounds/start.mp4',
    TEAM_VIEW_BG: '/backgrounds/teamview.mp4',
    WAGER_BG: '/backgrounds/wager.mp4',
    PRIZE_GREEN_BG: '/backgrounds/prize-green.mp4',
    PRIZE_RED_BG: '/backgrounds/prize-red.mp4',
  },
  IMAGES: {
    COINS_OVERLAY: '/videos/coins.png',
    VS: '/vs.png',
    CARD_BACK: '/heads/cardback.png',
    WAGER_RULES: '/backgrounds/wager_rules.png',
    NINJA_RULES_BG: '/ninjarules/ninjarules.png',
    ARGUE_BG: '/argue/argue.png',
  },
  
  // Dynamic path getters
  getRoundVideo: (round: number) => `/videos/${round}.mp4`,
  getTrialMusic: (round: number) => `/music/${round}.mp3`,
  getRandomizerMusic: (mode: string) => `/music/${mode}.mp3`,
  getBossVideo: (id: number) => `/bosses/${id}.mp4`,
  getTrialVideo: (id: string | number) => `/trialvideos/${id}.mp4`,
};
