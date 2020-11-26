import debug from "debug";
import FeatureQuestRepository from "../repository/FeatureQuestRepository";
import {IProfile} from "../models/Profile";
import ConfigQuestRepository from "../repository/ConfigQuestRepository";
import RankRepository from "../repository/RankRepository";
import {QuestFeatureType} from "../features/interface/IQuestFeature";
import QuestResult from "../pattern/QuestFactory";
import Quest, {QuestFactory} from "../pattern/QuestFactory";
import FeatureQuest, {IFeatureQuest} from "../models/FeatureQuest";
import _ from "lodash";
import Utils from "../common/Utils";
import {IGameHistory} from "../features/interface/IGameHistory";

const INFO = debug('info:@services/QuestService');
const ERROR = debug('error:@services/QuestService');

class QuestService {
    private readonly feature_quest_repo: FeatureQuestRepository;
    private readonly config_quest_repo: ConfigQuestRepository;
    private readonly rank_repo: RankRepository;

    constructor() {
        this.feature_quest_repo = new FeatureQuestRepository();
        this.config_quest_repo = new ConfigQuestRepository();
        this.rank_repo = new RankRepository();
    }

    async updateQuest(profile: IProfile, game_history: IGameHistory): Promise<boolean> {
        let quest = new QuestFactory();
        let feature_quest: IFeatureQuest = await this.feature_quest_repo.getByProfileId(profile.profile_id);
        let quests: QuestResult[] = feature_quest.quests;

        await Promise.all(quests.map(async q => {
            await quest.checkProgress(q, profile.profile_id, game_history);
        })).catch(e => {
            ERROR(`Updated quest error: ${e}`);
            return false;
        });

        await this.feature_quest_repo.updateListQuest(feature_quest);
        return true;
    }

    async initOrUpdateQuest(profile: IProfile): Promise<IFeatureQuest> {
        // await this.config_quest_repo.initQuestTest();
        let quest = new QuestFactory();
        let profile_id: number = profile.profile_id;
        let feature_quest: IFeatureQuest = await this.feature_quest_repo.getByProfileId(profile_id);
        let new_daily_quest: Quest[] = await quest.createQuest(QuestFeatureType.DAILY, profile).getDailyQuest();
        // let new_monthly_quest,... etc
        let temp_quests: Quest[] = [];

        if (_.isEmpty(feature_quest)) {
            feature_quest = new FeatureQuest();
            feature_quest.profile_id = profile_id;
            feature_quest.quests = [...new_daily_quest]; // add more
            feature_quest.daily_updated_at = Utils.getToDay();
            feature_quest.weekly_updated_at = Utils.getToDay();
            feature_quest.monthly_updated_at = Utils.getToDay();
            await feature_quest.save();
            return feature_quest;
        }

        let {daily_updated_at} = feature_quest; // check week,month too
        let quest_remain = feature_quest.quests.filter(q => Utils.isNotExpired(q.started_at, q.ended_at));
        temp_quests = [...temp_quests, ...quest_remain];
        if (!Utils.isToday(daily_updated_at)) {
            temp_quests = [...temp_quests, ...new_daily_quest];
            feature_quest.daily_updated_at = Utils.getToDay();
        }
        // TODO as same week and month

        feature_quest.quests = temp_quests;
        await this.feature_quest_repo.updateListQuest(feature_quest);
        return feature_quest;
    }
}

export default new QuestService();