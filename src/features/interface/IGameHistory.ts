export interface IGameHistory {
    user_id: number;
    is_bot: boolean;
    buy_in: number;
    bet_amount: number;
    win_amount: number;
    lose_amount: number;
    fee_rate: number;
    hand_result: string;
    card_have: string;
    card_rank: string;
    end_state: string;
    room_info: string;
    room_type: string;
    game_type: string;
    state_logs: any;
    pot_logs: any;
    hand_blackjack: number;
    insurance_win: number;
    double_win: number;
    naturals: number;
    royalties: number;
    rank_sng: number;
}