import Quest, {QuestBetConfig, QuestEarnChipConfig, QuestPlayConfig, QuestWinConfig} from "./QuestFactory";
import {QuestFeatureCategory} from "../features/interface/IQuestFeature";
import GameProfileDailyRepository from "../repository/GameProfileDailyRepository";
import _ from "lodash";
import debug from "debug";
import {IGameHistory} from "../features/interface/IGameHistory";
import Utils from "../common/Utils";

const INFO = debug('info:@pattern/QuestAdapter');
const ERROR = debug('error:@pattern/QuestAdapter');

const MIN_PROGRESS = 0;
const MAX_PROGRESS = 100;

export default class QuestAdapter {
    checkProgress: (quest: Quest, profile_id: number, game_history: IGameHistory) => Promise<Quest>;

    constructor() {
        this.checkProgress = (quest: Quest, profile_id: number, game_history: IGameHistory) => {
            let category: QuestFeatureCategory = quest.category;
            switch (category) {
                case QuestFeatureCategory.WIN:
                    return new QuestWin(quest, profile_id, game_history).checkProgress;
                case QuestFeatureCategory.PLAY:
                    return new QuestPlay(quest, profile_id).checkProgress;
                case QuestFeatureCategory.EARN_CHIP:
                    return new QuestEarnChip(quest, profile_id).checkProgress;
                case QuestFeatureCategory.SPIN_DRAW:
                    break;
                case QuestFeatureCategory.EMOTICON:
                    break;
                case QuestFeatureCategory.TIP:
                    break;
                case QuestFeatureCategory.BET:
                    return new QuestBet(quest, profile_id).checkProgress;
            }
        }
    }
}

class QuestPlay {
    private readonly quest: Quest;
    private profile_id: number;
    public checkProgress: Promise<Quest>;

    constructor(quest: Quest, profile_id: number) {
        this.quest = quest;
        this.profile_id = profile_id;
        this.checkProgress = this._checkProgress(quest, profile_id);
    }

    private async _checkProgress(quest: Quest, profile_id: number) {
        let conditions = quest.conditions;
        let requires = quest.requires;
        let total_hand: number = 0;

        let game_type: string = conditions[QuestPlayConfig.GAME_TYPE];
        let played_times_require: number = conditions[QuestPlayConfig.PLAYED_TIMES] || 0;

        if (!_.isEmpty(game_type)) {
            let game_profile = await new GameProfileDailyRepository().findProfileDailyById(profile_id);
            total_hand += game_profile.total_hand;
        } else {
            let game_profile = await new GameProfileDailyRepository().findByProfileId(profile_id);
            game_profile.map(profile => {
                total_hand += profile.total_hand;
            });
        }

        if (!this.quest.completed) {
            this.quest.contents = total_hand + '/' + played_times_require;
            let progress: number = Number((total_hand * MAX_PROGRESS / played_times_require).toFixed(2));
            this.quest.progress = Utils.limitNumberWithinRange(progress, MIN_PROGRESS, MAX_PROGRESS);
            if (this.quest.progress === MAX_PROGRESS) {
                this.quest.contents = played_times_require + '/' + played_times_require;
                this.quest.completed = true;
            }
        }
        return this.quest;
    }
}

class QuestBet {
    private readonly quest: Quest;
    private profile_id: number;
    public checkProgress: Promise<Quest>;

    constructor(quest: Quest, profile_id: number) {
        this.quest = quest;
        this.profile_id = profile_id;
        this.checkProgress = this._checkProgress(quest, profile_id);
    }

    private async _checkProgress(quest: Quest, profile_id: number) {
        let conditions = quest.conditions;
        let requires = quest.requires;
        let min_bet: number = 0;

        let game_type: string = conditions[QuestBetConfig.GAME_TYPE];
        let min_require: number = conditions[QuestBetConfig.MIN_BET_AMOUNT] || 0;

        if (!_.isEmpty(game_type)) {
            let game_profile = await new GameProfileDailyRepository().findProfileDailyById(profile_id);
            min_bet = game_profile.biggest_bet;
        } else {
            let game_profile = await new GameProfileDailyRepository().findByProfileId(profile_id);
            game_profile.map(profile => {
                min_bet = profile.biggest_bet > min_bet ? profile.biggest_bet : min_bet;
            });
        }

        if (!this.quest.completed) {
            if (min_bet >= min_require) {
                this.quest.progress = MAX_PROGRESS;
                this.quest.contents = `${min_require} / ${min_require}`;
                this.quest.completed = true;
            } else {
                this.quest.contents = '0/' + min_require;
            }
        }
        return this.quest;
    }
}

class QuestWin {
    private readonly quest: Quest;
    private profile_id: number;
    private readonly game_history: IGameHistory;
    public checkProgress: Promise<Quest>;

    constructor(quest: Quest, profile_id: number, game_history: IGameHistory) {
        this.quest = quest;
        this.profile_id = profile_id;
        this.game_history = game_history;
        this.checkProgress = this._checkProgress(quest, profile_id);
    }

    private async _checkProgress(quest: Quest, profile_id: number) {
        let conditions = quest.conditions;
        let requires = quest.requires;
        let win_amount: number = 0;
        let win_times: number = 0;
        let contents: string = quest.contents;

        let game_type: string = conditions[QuestWinConfig.GAME_TYPE] || '';
        let win_amount_require: number = conditions[QuestWinConfig.WIN_AMOUNT] || 0;
        let win_times_require: number = conditions[QuestWinConfig.WIN_TIMES] || 0;

        if (!_.isEmpty(game_type)) { // Handle for only game or multi game
            let game_profile = await new GameProfileDailyRepository().findProfileDailyById(profile_id);

            if (win_amount_require > 0) {
                win_amount = game_profile.biggest_win;
            }

            if (win_times_require > 0 && game_type === this.game_history.game_type &&
                this.game_history.win_amount > 0) {
                win_times = parseInt(contents.split('/')[0]) + 1;
            }

        } else { // Handle for all
            let game_profile = await new GameProfileDailyRepository().findByProfileId(profile_id);
            game_profile.map(profile => {
                win_amount = profile.biggest_win > win_amount ? profile.biggest_win : win_amount;
            });

            if (win_times_require > 0 &&
                this.game_history.win_amount > 0) {
                win_times = parseInt(contents.split('/')[0]) + 1;
            }
        }

        if (!this.quest.completed) {
            if (win_amount_require > 0 && win_amount >= win_amount_require) {
                this.quest.progress = MAX_PROGRESS;
                this.quest.contents = '1/1';
                this.quest.completed = true;
            } else {
                this.quest.contents = '0/' + win_amount_require;
            }

            if (win_times_require > 0) {
                let progress: number = Number((win_times * MAX_PROGRESS / win_times_require).toFixed(2));
                this.quest.progress = Utils.limitNumberWithinRange(progress, MIN_PROGRESS, MAX_PROGRESS);
                this.quest.contents = win_times + '/' + win_times_require;
                if (win_times === win_times_require) {
                    this.quest.completed = true;
                }
            }
        }

        return this.quest;
    }
}

class QuestEarnChip {
    private readonly quest: Quest;
    private profile_id: number;
    public checkProgress: Promise<Quest>;

    constructor(quest: Quest, profile_id: number) {
        this.quest = quest;
        this.profile_id = profile_id;
        this.checkProgress = this._checkProgress(quest, profile_id);
    }

    private async _checkProgress(quest: Quest, profile_id: number) {
        let conditions = quest.conditions;
        let requires = quest.requires;
        let total_win: number = 0;

        let game_type: string = conditions[QuestEarnChipConfig.GAME_TYPE];
        let min_require: number = conditions[QuestEarnChipConfig.TOTAL_WIN] || 0;

        if (!_.isEmpty(game_type)) {
            let game_profile = await new GameProfileDailyRepository().findProfileDailyById(profile_id);
            total_win = game_profile.total_win_amount;
        } else {
            let game_profile = await new GameProfileDailyRepository().findByProfileId(profile_id);
            game_profile.map(profile => {
                total_win += profile.total_win_amount;
            });
        }

        if (!this.quest.completed) {
            let progress: number = Number((total_win * MAX_PROGRESS / min_require).toFixed(2));
            this.quest.progress = Utils.limitNumberWithinRange(progress, MIN_PROGRESS, MAX_PROGRESS);
            this.quest.contents = total_win + '/' + min_require;
            if (this.quest.progress === MAX_PROGRESS) {
                this.quest.completed = true;
                this.quest.contents = min_require + '/' + min_require;
            }
        }
        return this.quest;
    }
}
