import GameProfile, {IGameProfile} from "../models/GameProfile";
import {mongoose} from "@colyseus/social";
import {IProfile} from "../models/Profile";
import _ from "lodash";
import debug from "debug";
import "reflect-metadata";
import GameProfileDailyRepository from "./GameProfileDailyRepository";
import GameProfileDaily, {IGameProfileDaily} from "../models/GameProfileDaily";
import {GAME_CODE} from "../common/Define";
import {IGameHistory} from "../features/interface/IGameHistory";

const INFO = debug('info:@repository/GameProfileRepo');
const ERROR = debug('error:@repository/GameProfileRepo');

export default class GameProfileRepository {
    private daily_repo: GameProfileDailyRepository;

    constructor() {
        this.daily_repo = new GameProfileDailyRepository();
    }

    /**
     * @param profile_id
     * @param game_type
     */
    async findGameProfileById(profile_id: number, game_type = ''): Promise<IGameProfile> {
        let condition: { [k: string]: any } = {};
        condition.profile_id = profile_id;
        if (!!game_type) {
            condition.game_type = game_type;
        }
        return await GameProfile.findOne(condition).exec();
    }

    async findOrCreateGameProfileById(profile_id: number, game_type = ''): Promise<IGameProfile> {
        try {
            let game_profile: IGameProfile = await this.findGameProfileById(profile_id, game_type);
            if (_.isEmpty(game_profile)) {
                game_profile = new GameProfile();
                game_profile.profile_id = profile_id;
                game_profile.game_type = game_type;
                await game_profile.save();
            }
            return game_profile;
        } catch (error) {
            ERROR(`Create game profile fail ${error}`);
            return null;
        }
    }

    async insertOrUpdateGameProfile(profile: IProfile, game_history: IGameHistory): Promise<boolean> {
        let session = await mongoose.startSession();
        let profile_id: number = profile.profile_id;
        let game_type: string = game_history.game_type;
        let game_profile: IGameProfile = await this.findOrCreateGameProfileById(profile_id, game_type);
        let daily_profile: IGameProfileDaily = await this.daily_repo.findOrCreateProfileDailyById(profile_id, game_type);
        let bet_amount: number = game_history.bet_amount;
        let win_amount: number = game_history.win_amount;

        if (_.isEmpty(game_profile) || _.isEmpty(daily_profile)) {
            return false;
        }

        let inc_game_profile: any = {
            total_hand: 1,
        };
        let set_game_profile: any = {};

        let inc_game_profile_daily: any = {
            total_hand: 1,
        };
        let set_game_profile_daily: any = {};

        session.startTransaction();
        try {
            if (win_amount > 0) {
                inc_game_profile.total_win_amount = win_amount;
                inc_game_profile.total_hand_win = 1;

                inc_game_profile_daily.total_win_amount = win_amount;
                inc_game_profile_daily.total_hand_win = 1;
            }

            if (bet_amount > game_profile.biggest_bet) {
                set_game_profile.biggest_bet = bet_amount;
            }

            if (bet_amount > daily_profile.biggest_bet) {
                set_game_profile_daily.biggest_bet = bet_amount;
            }

            if (win_amount > game_profile.biggest_win) {
                set_game_profile.biggest_win = win_amount;
            }

            if (win_amount > daily_profile.biggest_win) {
                set_game_profile_daily.biggest_win = win_amount;
            }

            switch (game_type) {
                case GAME_CODE.HOLDEM:
                case GAME_CODE.OMAHA:
                case GAME_CODE.HONGKONG:
                    let card_rank: string = game_history.card_rank; // 1191627,1,3c,3d,Ac,Qs,Jh,Ts,4s
                    let _hRanks = card_rank.split(',');
                    let best_hand_rank = _.toNumber(_hRanks[0]) || 0; // 1191627
                    let best_hand_pattern = _.toNumber(_hRanks[1]) || 0; // 1
                    let best_hand_card = _.slice(_hRanks, 2, 7);
                    best_hand_card = _.filter(best_hand_card, c => c !== '-'); // [1,3c,3d,Ac,Qs,Jh]

                    if (best_hand_rank > game_profile.best_hand_rank) {
                        set_game_profile.best_hand_rank = best_hand_rank;
                        set_game_profile.best_hand_pattern = best_hand_pattern;
                        set_game_profile.best_hand_card = best_hand_card;
                    }

                    if (best_hand_rank > daily_profile.best_hand_rank) {
                        set_game_profile_daily.best_hand_rank = best_hand_rank;
                        set_game_profile_daily.best_hand_pattern = best_hand_pattern;
                        set_game_profile_daily.best_hand_card = best_hand_card;
                    }
                    break;
                case GAME_CODE.CHINESE:
                    inc_game_profile.total_naturals = game_history.naturals;
                    inc_game_profile.total_royalties = game_history.royalties;

                    inc_game_profile_daily.total_naturals = game_history.naturals;
                    inc_game_profile_daily.total_royalties = game_history.royalties;
                    break;
                case GAME_CODE.BLACKJACK:
                    inc_game_profile.double_win = game_history.double_win;
                    inc_game_profile.hand_blackjack = game_history.hand_blackjack;
                    inc_game_profile.insurance_win = game_history.insurance_win;

                    inc_game_profile_daily.double_win = game_history.double_win;
                    inc_game_profile_daily.hand_blackjack = game_history.hand_blackjack;
                    inc_game_profile_daily.insurance_win = game_history.insurance_win;
                    break;
                case GAME_CODE.SITNGO_HOLDEM:
                case GAME_CODE.SITNGO_HONGKONG:
                    game_profile.amount_join_sng += game_history.fee_rate;
                    daily_profile.amount_join_sng += game_history.fee_rate;

                    let rank_board_profile = game_profile.rank_board_sng;
                    rank_board_profile['rank_' + game_history.rank_sng] += 1;

                    let rank_board_daily = daily_profile.rank_board_sng;
                    rank_board_daily['rank_' + game_history.rank_sng] += 1;

                    set_game_profile.rank_board_sng = rank_board_profile;
                    set_game_profile_daily.rank_board_sng = rank_board_profile;
                    break;
            }

            await GameProfile.findOneAndUpdate({
                _id: game_profile._id
            }, {
                $set: set_game_profile,
                $inc: inc_game_profile
            });

            await GameProfileDaily.findOneAndUpdate({
                _id: daily_profile._id
            }, {
                $set: set_game_profile_daily,
                $inc: inc_game_profile_daily
            });

            await game_profile.save();
            await daily_profile.save();
            await session.commitTransaction();
            session.endSession();
            return true;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            return false;
        }
    }
}