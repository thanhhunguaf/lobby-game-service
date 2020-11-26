import FeatureQuest, {IFeatureQuest} from "../models/FeatureQuest";

export default class FeatureQuestRepository {

    async getByProfileId(profile_id: number): Promise<IFeatureQuest> {
        return FeatureQuest.findOne({
            profile_id: profile_id
        }).exec();
    }

    async updateListQuest(quest: IFeatureQuest) {
        await FeatureQuest.findByIdAndUpdate({
            _id: quest._id
        }, {
            quests: quest.quests,
            daily_updated_at: quest.daily_updated_at,
            weekly_updated_at: quest.weekly_updated_at,
            monthly_updated_at: quest.monthly_updated_at
        });
    }
}