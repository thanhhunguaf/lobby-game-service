import Wallet from "./Wallet";
import GameProfile from "./GameProfile";

export default class Profile {
    id: number;
    nickname: string;
    avatar: string;
    wallet: Wallet;
    game_profile: GameProfile
}