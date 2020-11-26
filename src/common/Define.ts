export const PORT = 9999;
export const DEFAULT_VIP = 0;
export const DEFAULT_RANK_LEVEL = 0;
export const DEFAULT_RANK_DIVISION = 0;
export const DEFAULT_RANK_PREV_SEASON = 0;

export enum GAME_CODE {
    HOLDEM = 'txh',
    OMAHA = 'omh',
    HONGKONG = 'phk',
    CHINESE = 'cpk',
    BLACKJACK = 'bjk',
    SITNGO_HOLDEM = 'sng_txh',
    SITNGO_HONGKONG = 'sng_phk'
}

export enum GAME_HAND_RESULT {
    WIN = 'win',
    LOSE = 'lose'
}

export enum AMQP_GAME_MESSAGE {
    HOLDEM_OMAHA_HONGKONG = 'finishHand',
    CHINESE = 'chineseFinishHand',
    BLACKJACK = 'blackjackFinishHand',
    TOUR = 'finishTour'
}