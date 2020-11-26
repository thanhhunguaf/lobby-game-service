import {Document, model, Schema} from "mongoose";
import {QuestFeatureCategory, QuestFeatureType} from "../features/interface/IQuestFeature";

export interface IConfigQuest extends Document {
    quest_id: number,
    type: QuestFeatureType,
    category: QuestFeatureCategory,
    requires: any,
    conditions: any,
    description: string,
    key: string
}

const ConfigQuestSchema = new Schema({
    quest_id: {type: Number, required: true, unique: true},
    type: {type: String, default: null},
    category: {type: String, default: null},
    requires: {type: Object, default: {}},
    conditions: {type: Object, default: {}},
    description: {type: String, default: null},
    key: {type: String, default: null},
}, {autoIndex: true, versionKey: false});

export default model<IConfigQuest>("config_quest", ConfigQuestSchema, 'config_quest');