import GameProfileDaily, {IGameProfileDaily} from "../models/GameProfileDaily";
import debug from "debug";
import _ from "lodash";
import Utils from "../common/Utils";

const INFO = debug('info:@services/GameProfileDailyRepo');
const ERROR = debug('error:@services/GameProfileDailyRepo');

export default class GameProfileDailyRepository {
    /**
     * @param profile_id
     * @param game_type
     */
    async findProfileDailyById(profile_id: number, game_type = ''): Promise<IGameProfileDaily> {
        let condition: { [k: string]: any } = {};
        condition.profile_id = profile_id;
        if (!!game_type) {
            condition.game_type = game_type;
        }
        return await GameProfileDaily.findOne(condition).exec();
    }

    /**
     * @param profile_id
     * @param game_type
     */
    async findOrCreateProfileDailyById(profile_id: number, game_type = ''): Promise<IGameProfileDaily> {
        try {
            let profile_daily: IGameProfileDaily = await this.findProfileDailyById(profile_id, game_type);
            if (_.isEmpty(profile_daily)) {
                profile_daily = new GameProfileDaily();
                profile_daily.profile_id = profile_id;
                profile_daily.game_type = game_type;
                profile_daily.created_at = Utils.getToDay();
                await profile_daily.save();
            }
            return profile_daily;
        } catch (error) {
            ERROR(`Create profile daily fail ${error}`);
            return null;
        }
    }

    /**
     * @param profile_id
     */
    async findByProfileId(profile_id: number): Promise<IGameProfileDaily[]> {
        return GameProfileDaily.find({
            profile_id: profile_id
        }).exec();
    }
}