import RankRepository from "../repository/RankRepository";
import { IGameRank } from "../models/GameRank";

class RankService {
    rankRepository: RankRepository;
    constructor() {
        this.rankRepository = new RankRepository();
    }

    async findByRankAndDivision(rank: number, division: number): Promise<IGameRank> {
        try {
            return await this.rankRepository.findByLevelAndDivision(rank, division);
        } catch (error) {
            return null;
        }
    }

    async findByRankPoint(rankPoint: number) {
        try {
            return await this.rankRepository.findByRankPoint(rankPoint);
        } catch (error) {

        }
    }
}

export default new RankService();