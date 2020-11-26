import Profile, {IProfile} from "../models/Profile";
import Rank, {IGameRank} from "../models/GameRank";
import debug from "debug";
import _ from "lodash";
import {mongoose} from "@colyseus/social";

const ERROR = debug("error:@repository/ProfileRepository");
const INFO = debug("info:@repository/ProfileRepository");

export default class ProfileRepository {
    async findProfileById(profile_id: number): Promise<IProfile> {
        return await Profile
            .findOne({
                profile_id: profile_id
            }).exec();
    }

    async updateRankByProfileIdAndRankPoint(profile_id: number, point: number): Promise<boolean> {
        let session = await mongoose.startSession();
        session.startTransaction();
        try {
            const opts = {'new': true};
            // add or sub rank point
            let profile: IProfile = await Profile.findOneAndUpdate({
                    profile_id: profile_id
                }, {
                    $inc: {point_rank: point}
                },
                opts);

            //update rankPoint = 0 if rankPoint < 0
            if (profile.point_rank < 0) {
                profile = await Profile.findOneAndUpdate({
                        profile_id: profile_id
                    }, {
                        $max: {point_rank: 0}
                    },
                    opts);
            }

            // update rank of profile with rank point
            let rank: IGameRank[] = await Rank.find({
                point_rank: {
                    $lte: profile.point_rank
                }
            }).sort({point_rank: -1}).limit(1);

            if (!_.isEmpty(rank)) {
                profile.game_rank = rank[0];
                await profile.save();
                await session.commitTransaction();
                session.endSession();
                return true;
            }
            await session.abortTransaction();
            session.endSession();
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            return false;
        }
    }
}