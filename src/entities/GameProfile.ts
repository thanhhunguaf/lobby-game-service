export default class GameProfile {
    season: number;
    game_vip: {
        vip: number,
        name: string,
        point_vip: number
    };
    game_rank: {
        rank: number,
        tier: number,
        name: string,
        point_rank: number
    };
    game_rank_prev_season: number;
    point_reward: number;
    point_rank_prev_season: number
}