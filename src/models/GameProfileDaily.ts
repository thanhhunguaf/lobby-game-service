import {Document, model, Schema} from "mongoose";
import Utils from "../common/Utils";
import {rank_board} from "./GameProfile";

export interface IGameProfileDaily extends Document {
    _id: Schema.Types.ObjectId,
    profile_id: number,
    game_type: string,
    total_hand: number,
    total_hand_win: number,
    total_win_amount: number,
    best_hand_rank: number,
    best_hand_pattern: number,
    best_hand_card: any,
    biggest_bet: number,
    biggest_win: number
    hand_blackjack: number,
    insurance_win: number,
    double_win: number,
    total_naturals: number,
    total_royalties: number,
    amount_join_sng: number,
    rank_board_sng: any,
    created_at: string
}

const GameProfileDaily = new Schema({
    profile_id: {type: Number, required: true},
    game_type: {type: String, default: null},
    total_hand: {type: Number, default: 0},
    total_hand_win: {type: Number, default: 0},
    total_win_amount: {type: Number, default: 0},
    best_hand_pattern: {type: Number, default: 0},
    best_hand_rank: {type: Number, default: 0},
    best_hand_card: {type: Array, default: null},
    biggest_bet: {type: Number, default: 0},
    biggest_win: {type: Number, default: 0},
    hand_blackjack: {type: Number, default: 0},
    insurance_win: {type: Number, default: 0},
    double_win: {type: Number, default: 0},
    total_naturals: {type: Number, default: 0},
    total_royalties: {type: Number, default: 0},
    amount_join_sng: {type: Number, default: 0},
    rank_board_sng: {type: Object, default: rank_board},
    created_at: {type: String, default: Utils.getToDay}
}, {autoIndex: true, versionKey: false});

GameProfileDaily.index({
    profile_id: 1,
    game_type: 1
}, {unique: true});

export default model<IGameProfileDaily>('game_profile_daily', GameProfileDaily, 'game_profile_daily');