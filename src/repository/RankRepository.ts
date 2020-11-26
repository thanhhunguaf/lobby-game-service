import {Schema} from "mongoose";
import GameRank, {IGameRank} from "../models/GameRank";

export default class RankRepository {
    async findById(id: Schema.Types.ObjectId): Promise<IGameRank> {
        return GameRank.findById(id);
    }

    async findByLevelAndDivision(tier: number, division: number): Promise<IGameRank> {
        return GameRank.findOne({
            tier: tier,
            division: division
        });
    }

    async findByRankPoint(rank_point: number): Promise<IGameRank> {
        let game_rank = await GameRank.find({
            point_rank: {$lte: rank_point}
        }).sort({point_rank: -1}).limit(1)
        return game_rank[0];
    }
}