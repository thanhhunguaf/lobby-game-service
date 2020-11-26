import {Document, model, Schema} from "mongoose";

export interface IGameVip extends Document {
    vip: number;
    name: string;
    point_vip: number;
}

const GameVipSchema = new Schema({
    vip: {type: Number, required: true, unique: true},
    name: {type: String, required: true},
    point_vip: {type: Number, required: true, min: 0},
    _class: {type: String, required: true, default: "GameVipEntity"}
}, {autoIndex: true, versionKey: false});

export default model<IGameVip>("game_vip", GameVipSchema, 'game_vip');