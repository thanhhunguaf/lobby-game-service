import {Message} from "amqp-ts";
import debug from 'debug';
import ProfileService from "../../services/ProfileService";
import {IProfile} from "../../models/Profile";
import {AMQP_GAME_MESSAGE} from "../../common/Define";
import {IQueueMessage} from "../interface/IQueueMessage";
import {IGameHistory} from "../interface/IGameHistory";
import QuestService from "../../services/QuestService";
import _ from "lodash";
import GameProfileRepository from "../../repository/GameProfileRepository";
import GameProfileDailyRepository from "../../repository/GameProfileDailyRepository";

const ERROR = debug("error:@feature/game/FeatureGameManager");
const INFO = debug("info:@feature/game/FeatureGameManager");

class FeatureGameManager {
    private game_profile: GameProfileRepository;
    private game_profile_daily: GameProfileDailyRepository;

    constructor() {
        this.game_profile = new GameProfileRepository();
        this.game_profile_daily = new GameProfileDailyRepository();
    }

    async onMessage(message: Message) {
        let isAck = true;
        try {
            let content: IQueueMessage<any> = JSON.parse(message.getContent());
            // let content: IQueueMessage<any> = JSON.parse(JSON.stringify(message.getContent()));
            let action: string = content.action;
            // INFO('content', message.getContent());
            switch (action) {
                case AMQP_GAME_MESSAGE.HOLDEM_OMAHA_HONGKONG:
                    isAck = await this.handleTxhOmhHk(content);
                    break;
                case AMQP_GAME_MESSAGE.CHINESE:
                    isAck = await this.handleCpk(content);
                    break;
                case AMQP_GAME_MESSAGE.BLACKJACK:
                    isAck = await this.handleBjk(content);
                    break;
                case AMQP_GAME_MESSAGE.TOUR:
                    isAck = await this.handleTour(content);
                    break;
                default:
                    ERROR(`Unable handle message:`, content.action);
                    isAck = false;
                    break;
            }
        } catch (error) {
            ERROR(`Format message content not correct: `, error);
        } finally {
            try {
                message.ack(isAck);
            } catch (e) {
                ERROR(`ERROR ACK: `, e);
            }
        }
    }

    async handleTxhOmhHk(msg: IQueueMessage<any>): Promise<boolean> {
        let game_history: IGameHistory = msg.params;
        let bet_amount: number = game_history.bet_amount;
        let win_amount: number = game_history.win_amount;
        let rank_point: number = win_amount - bet_amount;

        let profile_id: number = game_history.user_id;
        let invalid = await this._preInvalid(profile_id, game_history.game_type);
        if (invalid) {
            return false;
        }

        let profile: IProfile = await ProfileService.findOrCreateProfileById(profile_id);

        await ProfileService.updateRank(profile_id, rank_point);
        await ProfileService.updateGameProfile(profile, game_history);

        if (!game_history.is_bot) {
            await QuestService.updateQuest(profile, game_history);
        }
        return true;
    }

    async handleCpk(msg: IQueueMessage<any>): Promise<boolean> {
        let game_history: IGameHistory[] = await this._convertMsgCpk(msg);
        for (const his of game_history) {
            let profile_id: number = his.user_id;
            let invalid = await this._preInvalid(profile_id, his.game_type)
            if (invalid) {
                return false;
            }
            let profile: IProfile = await ProfileService.findOrCreateProfileById(profile_id);
            let rank_point = his.win_amount - his.lose_amount;

            await ProfileService.updateRank(profile.profile_id, rank_point);
            await ProfileService.updateGameProfile(profile, his);
            if (!his.is_bot) {
                await QuestService.updateQuest(profile, his);
            }
        }
        return true;
    }

    async handleBjk(msg: IQueueMessage<any>): Promise<boolean> {
        let game_history: IGameHistory[] = await this._convertMsgBjk(msg);
        for (const his of game_history) {
            let profile_id: number = his.user_id;
            let invalid = await this._preInvalid(profile_id, his.game_type)
            if (invalid) {
                return false;
            }
            let profile: IProfile = await ProfileService.findOrCreateProfileById(profile_id);
            let rank_point = his.win_amount - his.lose_amount;

            await ProfileService.updateRank(profile.profile_id, rank_point);
            await ProfileService.updateGameProfile(profile, his);
            if (!his.is_bot) {
                await QuestService.updateQuest(profile, his);
            }
        }
        return true;
    }

    async handleTour(msg: IQueueMessage<any>): Promise<boolean> {
        let game_history: IGameHistory = await this._convertTour(msg);
        let profile_id: number = game_history.user_id;
        let invalid = await this._preInvalid(profile_id, game_history.game_type);
        if (invalid) {
            return false;
        }

        let profile: IProfile = await ProfileService.findOrCreateProfileById(profile_id);

        await ProfileService.updateGameProfile(profile, game_history);

        if (!game_history.is_bot) {
            await QuestService.updateQuest(profile, game_history);
        }
        return true;
    }

    // Helper =============================================
    async _preInvalid(profile_id: number, game_type: string): Promise<boolean> {
        let profile: IProfile = await ProfileService.findOrCreateProfileById(profile_id);
        let game_profile = await this.game_profile.findOrCreateGameProfileById(profile.profile_id, game_type);
        let game_profile_daily = await this.game_profile_daily.findOrCreateProfileDailyById(profile.profile_id, game_type);
        return _.isEmpty(profile) || _.isEmpty(game_profile) || _.isEmpty(game_profile_daily);
    }

    async _convertTour(msg: IQueueMessage<any>): Promise<IGameHistory> {
        let game_data: any = msg.params;
        let {tour_info} = game_data;
        let win_amount = game_data.reward;
        let lose_amount = 0;
        if (win_amount <= 0) lose_amount = Math.abs(game_data.reward - tour_info.fee);
        return new GameHistory(
            0,
            tour_info.buy_in,
            "",
            "",
            "",
            tour_info.fee,
            tour_info.game_type,
            "",
            game_data.is_bot,
            "",
            "",
            tour_info.tour_type,
            "",
            game_data.user_id,
            win_amount,
            lose_amount,
            0,
            0,
            0,
            0,
            0,
            game_data.rank
        );
    }

    async _convertMsgBjk(msg: IQueueMessage<any>): Promise<IGameHistory[]> {
        let game_data: any = msg.params;
        let players = game_data.playerLogs;
        let game_type = game_data.gameType;
        let room_type = game_data.roomType;
        let player_his: IGameHistory[] = [];

        for (const player of players) {
            let win_amount = 0;
            let lose_amount = 0;
            let black_jack = 0;
            let insurance = 0;
            let double_win = 0;

            for (const splitLog of player.splitLogs) {
                win_amount += splitLog.winAmount;
                lose_amount += splitLog.loseAmount;
                if (splitLog.isBlackjack) black_jack++;
                if (splitLog.isDouble) double_win++;
            }
            if (player.isInsurance) insurance++;

            player_his.push(new GameHistory(
                player.totalBetAmount,
                0,
                "",
                "",
                "",
                0,
                game_type,
                '',
                player.isBot,
                '',
                '',
                room_type,
                '',
                player.profileId,
                win_amount,
                lose_amount,
                black_jack,
                insurance,
                double_win,
                0,
                0,
                0
            ));
        }
        return player_his;
    }

    async _convertMsgCpk(msg: IQueueMessage<any>): Promise<IGameHistory[]> {
        let game_data: any = msg.params;
        let players = game_data.playerLogs;
        let game_type = game_data.gameType;
        let fee_rate = game_data.feeRate;
        let room_type = game_data.roomType;
        let player_his: IGameHistory[] = [];
        let royalty_flag = "None";
        let naturals = 0;
        let royalties = 0;

        for (const player of players) {
            let settings = player.settings;
            for (const setting of settings) {
                if (setting.settingRoyalty !== royalty_flag) royalties++;
            }
            if (player.royalty !== royalty_flag) naturals++;
            player_his.push(new GameHistory(
                0,
                0,
                player.cards,
                player.settings,
                '',
                fee_rate,
                game_type,
                '',
                player.isBot,
                '',
                '',
                room_type,
                '',
                player.profileId,
                player.winAmount,
                player.loseAmount,
                0,
                0,
                0,
                naturals,
                royalties,
                0
            ));
        }
        return player_his;
    }
}

class GameHistory implements IGameHistory {
    bet_amount: number;
    buy_in: number;
    card_have: string;
    card_rank: string;
    end_state: string;
    fee_rate: number;
    game_type: string;
    hand_result: string;
    is_bot: boolean;
    pot_logs: any;
    room_info: string;
    room_type: string;
    state_logs: any;
    user_id: number;
    win_amount: number;
    lose_amount: number;
    hand_blackjack: number;
    insurance_win: number;
    double_win: number;
    naturals: number;
    royalties: number;
    rank_sng: number;

    constructor(bet_amount: number, buy_in: number, card_have: string,
                card_rank: string, end_state: string, fee_rate: number,
                game_type: string, hand_result: string, is_bot: boolean,
                pot_logs: any, room_info: string, room_type: string,
                state_logs: any, user_id: number, win_amount: number,
                lose_amount: number, hand_blackjack: number, insurance_win: number,
                double_win: number, naturals: number, royalties: number, rank_sng: any) {
        this.bet_amount = bet_amount;
        this.buy_in = buy_in;
        this.card_have = card_have;
        this.card_rank = card_rank;
        this.end_state = end_state;
        this.fee_rate = fee_rate;
        this.game_type = game_type;
        this.hand_result = hand_result;
        this.is_bot = is_bot;
        this.pot_logs = pot_logs;
        this.room_info = room_info;
        this.room_type = room_type;
        this.state_logs = state_logs;
        this.user_id = user_id;
        this.win_amount = win_amount;
        this.lose_amount = lose_amount;
        this.hand_blackjack = hand_blackjack;
        this.insurance_win = insurance_win;
        this.double_win = double_win;
        this.naturals = naturals;
        this.royalties = royalties;
        this.rank_sng = rank_sng;
    }
}

export default new FeatureGameManager();