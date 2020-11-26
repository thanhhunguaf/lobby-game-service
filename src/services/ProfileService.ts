import GameProfile, {IProfile} from "../models/Profile";
import ProfileRepository from "../repository/ProfileRepository";
import {IGameVip} from "../models/GameVip";
import VipRepository from "../repository/VipRepository";
import RankRepository from "../repository/RankRepository";
import {DEFAULT_RANK_DIVISION, DEFAULT_RANK_LEVEL, DEFAULT_VIP} from "../common/Define";
import {IGameRank} from "../models/GameRank";
import debug from "debug";
import {IGameProfile, rank_board} from "../models/GameProfile";
import GameProfileRepository from "../repository/GameProfileRepository";
import {IGameProfileDaily} from "../models/GameProfileDaily";
import GameProfileDailyRepository from "../repository/GameProfileDailyRepository";
import Utils from "../common/Utils";
import {IGameHistory} from "../features/interface/IGameHistory";

const INFO = debug('info:@services/ProfileService');
const ERROR = debug('error:@services/ProfileService');

class ProfileService {
    private readonly profile_repo: ProfileRepository;
    private readonly vip_repo: VipRepository;
    private readonly rank_repo: RankRepository;
    private readonly game_profile_repo: GameProfileRepository;
    private readonly game_profile_daily_repo: GameProfileDailyRepository

    constructor() {
        this.profile_repo = new ProfileRepository();
        this.vip_repo = new VipRepository();
        this.rank_repo = new RankRepository();
        this.game_profile_repo = new GameProfileRepository();
        this.game_profile_daily_repo = new GameProfileDailyRepository();
    }

    async findProfileById(profile_id: number): Promise<IProfile> {
        try {
            return this.profile_repo.findProfileById(profile_id);
        } catch (error) {
            return null;
        }
    }

    async findGameProfileById(profile_id: number): Promise<IGameProfile> {
        try {
            return this.game_profile_repo.findGameProfileById(profile_id);
        } catch (e) {
            return null;
        }
    }

    async findProfileDailyById(profile_id: number): Promise<IGameProfileDaily> {
        try {
            return this.game_profile_daily_repo.findProfileDailyById(profile_id);
        } catch (e) {
            return null;
        }
    }

    async findOrCreateProfileById(profile_id: number): Promise<IProfile> {
        try {
            let profile: IProfile = await this.findProfileById(profile_id);
            if (!profile) {
                let vip: IGameVip = await this.vip_repo.findById(DEFAULT_VIP);
                let rank: IGameRank = await this.rank_repo.findByLevelAndDivision(DEFAULT_RANK_LEVEL, DEFAULT_RANK_DIVISION);
                profile = new GameProfile();
                profile.profile_id = profile_id;
                profile.point_vip = vip.point_vip;
                profile.point_rank = rank.point_rank;
                profile.point_rank_prev_season = DEFAULT_RANK_DIVISION;
                profile.game_rank = rank;
                profile.game_vip = vip;
                await profile.save();
            }
            return profile;
        } catch (error) {
            ERROR(`Create profile fail ${error}`);
            return null;
        }
    }

    async updateRank(profileId: number, rankPoint: number): Promise<boolean> {
        try {
            return await this.profile_repo.updateRankByProfileIdAndRankPoint(profileId, rankPoint);
        } catch (error) {
            ERROR(`Update rank failed ${error}`);
            return false;
        }
    }

    async updateGameProfile(profile: IProfile, game_history: IGameHistory): Promise<boolean> {
        try {
            return await this.game_profile_repo.insertOrUpdateGameProfile(profile, game_history);
        } catch (error) {
            ERROR(`Update game profile failed ${error}`);
            return false;
        }
    }

    async resetDailyProfile(profile: IProfile) {
        let profile_id: number = profile.profile_id;
        try {
            let daily_profile: IGameProfileDaily[] = await this.game_profile_daily_repo.findByProfileId(profile_id);
            for (const daily of daily_profile) {
                if (!Utils.isToday(daily.created_at)) {
                    daily.total_hand = 0;
                    daily.total_hand_win = 0;
                    daily.total_win_amount = 0;
                    daily.best_hand_pattern = 0;
                    daily.best_hand_rank = 0;
                    daily.best_hand_card = null;
                    daily.biggest_bet = 0;
                    daily.biggest_win = 0;
                    daily.hand_blackjack = 0;
                    daily.insurance_win = 0;
                    daily.double_win = 0;
                    daily.total_naturals = 0;
                    daily.total_royalties = 0;
                    daily.amount_join_sng = 0;
                    daily.rank_board_sng = rank_board;
                    daily.created_at = Utils.getToDay();
                    await daily.save();
                }
            }
        } catch (error) {
            ERROR('Reset daily quest failed');
        }
    }
}

export default new ProfileService();