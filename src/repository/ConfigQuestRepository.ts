import ConfigQuest, {IConfigQuest} from "../models/ConfigQuest";
import debug from "debug";
import {QuestFeatureCategory, QuestFeatureType} from "../features/interface/IQuestFeature";

const INFO = debug('info:@repository/ConfigQuestRepository');
const ERROR = debug('error:@repository/ConfigQuestRepository');

export default class ConfigQuestRepository {
    async findByQuestId(quest_id: number): Promise<IConfigQuest> {
        return ConfigQuest.findOne({
            quest_id: quest_id
        }).exec();
    }

    async getALlQuest(): Promise<IConfigQuest[]> {
        return ConfigQuest.find({}).exec();
    }

    async getAllQuestByType(type: QuestFeatureType): Promise<IConfigQuest[]> {
        return ConfigQuest.find({
            type: type
        }).exec();
    }

    async initQuestTest() {
        let quest1 = new ConfigQuest();
        quest1.quest_id = 1;
        quest1.type = QuestFeatureType.DAILY;
        quest1.category = QuestFeatureCategory.PLAY;
        quest1.requires = {
            game_type: '',
            rank_min: '0',
            rank_max: '61'
        }
        quest1.conditions = {
            game_type: '',
            played_times: 10
        }
        quest1.description = 'play any 10 games'
        await quest1.save();

        let quest2 = new ConfigQuest();
        quest2.quest_id = 2;
        quest2.type = QuestFeatureType.DAILY;
        quest2.category = QuestFeatureCategory.WIN;
        quest2.requires = {
            game_type: '',
            rank_min: '0',
            rank_max: '61'
        }
        quest2.conditions = {
            game_type: '',
            win_times: 5
        }
        quest2.description = 'win any 5 games'
        await quest2.save();

        let quest3 = new ConfigQuest();
        quest3.quest_id = 3;
        quest3.type = QuestFeatureType.DAILY;
        quest3.category = QuestFeatureCategory.BET;
        quest3.requires = {
            game_type: '',
            rank_min: '0',
            rank_max: '61'
        }
        quest3.conditions = {
            game_type: '',
            min_bet_amount: 5000000
        }
        quest3.description = 'min bet 5m'
        await quest3.save();

        let quest4 = new ConfigQuest();
        quest4.quest_id = 4;
        quest4.type = QuestFeatureType.DAILY;
        quest4.category = QuestFeatureCategory.WIN;
        quest4.requires = {
            game_type: '',
            rank_min: '0',
            rank_max: '61'
        }
        quest4.conditions = {
            game_type: '',
            win_amount: 10000000
        }
        quest4.description = 'win 10m'
        await quest4.save();

        let quest5 = new ConfigQuest();
        quest5.quest_id = 5;
        quest5.type = QuestFeatureType.DAILY;
        quest5.category = QuestFeatureCategory.EARN_CHIP;
        quest5.requires = {
            game_type: '',
            rank_min: '0',
            rank_max: '61'
        }
        quest5.conditions = {
            game_type: '',
            total_win: 50000000
        }
        quest5.description = 'total win 50m'
        await quest5.save();
    }
}