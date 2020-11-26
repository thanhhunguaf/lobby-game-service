import {Document, model, Schema} from "mongoose";
import GameRank, {IGameRank} from "./GameRank";
import GameVip, {IGameVip} from "./GameVip";

export interface IProfile extends Document {
    _id: Schema.Types.ObjectId,
    profile_id: number;
    point_vip: number;
    point_rank: number;
    point_rank_prev_season: number;
    _class: string
    game_rank: IGameRank;
    game_vip: IGameVip;
}

const ProfileSchema = new Schema({
    profile_id: {type: Number, required: true},
    point_vip: {type: Number, required: true},
    point_rank: {type: Number, required: true},
    point_rank_prev_season: {type: Number, required: true, min: 0},
    _class: {type: String, required: true, default: "GameProfileEntity"},
    game_rank: {type: Object, required: true},
    game_vip: {type: Object, required: true}
}, {autoIndex: true, versionKey: false});

ProfileSchema.index({
    profile_id: 1,
}, {unique: true});

export default model<IProfile>("game_profile", ProfileSchema, 'game_profile');