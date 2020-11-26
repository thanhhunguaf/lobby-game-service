import {Document, model, Schema} from "mongoose";
import Quest from "../pattern/QuestFactory";

export interface IFeatureQuest extends Document {
    profile_id: number,
    quests: Quest[],
    daily_updated_at: string
    weekly_updated_at: string
    monthly_updated_at: string
}

const FeatureQuestSchema = new Schema({
    profile_id: {type: Number, required: true},
    quests: {type: Array, default: []},
    daily_updated_at: {type: String, default: null},
    weekly_updated_at: {type: String, default: null},
    monthly_updated_at: {type: String, default: null},
    _class: {type: String, required: true, default: "FeatureQuestEntity"}
}, {autoIndex: true, versionKey: false});

FeatureQuestSchema.index({
    profile_id: 1,
    type: 1
}, {unique: true});

export default model<IFeatureQuest>("feature_quest", FeatureQuestSchema, 'feature_quest');