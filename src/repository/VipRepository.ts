import GameVip, {IGameVip} from "../models/GameVip";

export default class VipRepository {
    async findById(vip: number) {
        return GameVip.findOne({
            vip: vip
        });
    }

    public async findByVipPoint(vip_point: number): Promise<IGameVip[]> {
        return GameVip.find({
            point_vip: {$lte: vip_point}
        }).sort({requirePoint: -1})
            .limit(1);
    }
}