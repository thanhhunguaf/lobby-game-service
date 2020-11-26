import {IProfile} from "../../models/Profile";
import {IGameHistory} from "./IGameHistory";

export enum QuestFeatureType {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    EVENT = 'event',
    FOREVER = 'forever'
}

export enum QuestFeatureCategory {
    WIN = 'win',
    PLAY = 'play',
    EARN_CHIP = 'earn_chip',
    SPIN_DRAW = 'spin_draw',
    EMOTICON = 'emoticon',
    TIP = 'tip',
    BET = 'bet'
}

export default interface IQuestFeature {
    type: QuestFeatureType;
    active: boolean;

    setType(v: QuestFeatureType): IQuestFeature;

    updateQuest(profile: IProfile, msg: IGameHistory): Promise<boolean>;
};