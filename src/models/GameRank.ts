import {Document, model, Schema} from "mongoose";

export interface IGameRank extends Document {
    tier: number;
    division: number;
    name: string;
    point_rank: number;
}

const GameRankSchema = new Schema({
    tier: {type: Number, required: true},
    division: {type: Number, required: true},
    name: {type: String, required: true, min: 0},
    point_rank: {type: Number},
    _class: {type: String, required: true, default: "GameRankEntity"}
}, {autoIndex: true, versionKey: false});

GameRankSchema.index({
    rank: 1,
    division: 1
}, {unique: true});

export default model<IGameRank>("game_rank", GameRankSchema, 'game_rank');