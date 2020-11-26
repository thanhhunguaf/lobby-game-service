import {QuestFeatureCategory, QuestFeatureType} from "../features/interface/IQuestFeature";
import {IProfile} from "../models/Profile";
import {IConfigQuest} from "../models/ConfigQuest";
import FeatureQuestRepository from "../repository/FeatureQuestRepository";
import ConfigQuestRepository from "../repository/ConfigQuestRepository";
import RankRepository from "../repository/RankRepository";
import debug from "debug";
import Utils from "../common/Utils";
import QuestAdapter from "./QuestAdapter";
import {IGameHistory} from "../features/interface/IGameHistory";

const INFO = debug('info:@pattern/QuestFactory');
const ERROR = debug('error:@pattern/QuestFactory');

export enum QuestPlayConfig {
    GAME_TYPE = 'game_type',
    PLAYED_TIMES = 'played_times'
}

export enum QuestBetConfig {
    GAME_TYPE = 'game_type',
    MIN_BET_AMOUNT = 'min_bet_amount'
}

export enum QuestWinConfig {
    GAME_TYPE = 'game_type',
    WIN_AMOUNT = 'win_amount',
    WIN_TIMES = 'win_times'
}

export enum QuestEarnChipConfig {
    GAME_TYPE = 'game_type',
    TOTAL_WIN = 'total_win'
}

export default class Quest {
    quest_id: number
    type: QuestFeatureType
    category: QuestFeatureCategory
    progress: number
    requires: any
    conditions: any
    contents: string
    completed: boolean
    received: boolean
    started_at: string
    ended_at: string

    constructor(quest_id: number, type: QuestFeatureType, category: QuestFeatureCategory,
                progress: number, requires: object, conditions: object, contents: string, completed: boolean, received: boolean, started_at: string, ended_at: string) {
        this.quest_id = quest_id;
        this.type = type;
        this.category = category;
        this.progress = progress;
        this.conditions = conditions;
        this.contents = contents;
        this.completed = completed;
        this.received = received;
        this.started_at = started_at;
        this.ended_at = ended_at;
    }
}

export class QuestFactory {
    createQuest: (type_quest: QuestFeatureType, profile: IProfile) => DailyQuest;
    checkProgress: (quest: Quest, profile_id: number, game_history: IGameHistory) => Promise<Quest>;

    constructor() {
        this.createQuest = (type_quest: QuestFeatureType, profile: IProfile) => {
            switch (type_quest) {
                case QuestFeatureType.DAILY:
                    return new DailyQuest(profile);
                case QuestFeatureType.WEEKLY:
                    break;
                case QuestFeatureType.MONTHLY:
                    break;
                case QuestFeatureType.EVENT:
                    break;
                case QuestFeatureType.FOREVER:
                    break;
            }
        }

        this.checkProgress = (quest: Quest, profile_id: number, game_history: IGameHistory) => new QuestAdapter().checkProgress(quest, profile_id, game_history);
    }
}

class DailyQuest {
    private readonly feature_quest_repo: FeatureQuestRepository;
    private readonly config_quest_repo: ConfigQuestRepository;
    private readonly rank_repo: RankRepository;
    private readonly dailyQuests: Promise<Quest[]>;

    constructor(profile: IProfile) {
        this.feature_quest_repo = new FeatureQuestRepository();
        this.config_quest_repo = new ConfigQuestRepository();
        this.rank_repo = new RankRepository();
        this.dailyQuests = this._getQuest(profile);
    }

    public getDailyQuest() {
        return this.dailyQuests;
    }

    private async _getQuest(profile: IProfile): Promise<Quest[]> {
        let {point_rank} = profile;
        let {tier, division} = await this.rank_repo.findByRankPoint(point_rank);
        return await this._makeNewQuest(tier, division);
    }

    private async _makeNewQuest(tier: number, division: number): Promise<Quest[]> {
        let list_quest: IConfigQuest[] = await this.config_quest_repo.getAllQuestByType(QuestFeatureType.DAILY);
        let temp_quest: Quest[] = [];
        let my_rank = parseInt(tier + '' + division);
        for (let i = 0; i < list_quest.length; i++) {
            const {quest_id, type, category, requires, conditions} = list_quest[i];
            if (parseInt(requires.rank_min) <= my_rank && my_rank <= parseInt(requires.rank_max)) {
                temp_quest.push(new Quest(
                    quest_id,
                    type,
                    category,
                    0,
                    requires,
                    conditions,
                    '0/' + (conditions[QuestPlayConfig.PLAYED_TIMES] ||
                    conditions[QuestBetConfig.MIN_BET_AMOUNT] ||
                    conditions[QuestWinConfig.WIN_AMOUNT] ||
                    conditions[QuestWinConfig.WIN_TIMES] ||
                    conditions[QuestEarnChipConfig.TOTAL_WIN]),
                    false,
                    false,
                    Utils.getToDay(),
                    Utils.getEndOfDay()
                ));
            }
        }
        return temp_quest;
    }
}