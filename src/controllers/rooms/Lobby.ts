import {Client, Room} from "colyseus";
import debug from "debug";
import http from "http";
import User from "../../entities/User";
import {SGEvent} from "../../helpers/SGEvent";
import {SGCloseCode} from "../../helpers/SGStatusCode";
import InviteFriendService from "../../services/InviteFriendService";
import ProfileService from "../../services/ProfileService";
import QuestService from "../../services/QuestService";
import OAuthController from "../OAuthController";
import UserManager from "../users/UserManager";
import {LobbyState} from "./State";
import redis from "redis";
import RoomUser from "../users/RoomUser";
import _ from "lodash";
import env from "../../env";
import {ORMProfile} from "../../entities/ORMProfile";
import {ORMUser} from "../../entities/ORMUser";
import SGMySqlConnection from "../../helpers/SGMySqlConnection";


const INFO = debug('info:@rooms/Lobby');
const ERROR = debug('error:@rooms/Lobby');

export class Lobby extends Room<LobbyState> {
    onCreate(options: any) {
        this.roomName = "lobby";
        this.setSimulationInterval((deltaTime) => this.update(deltaTime));
        this.setState(new LobbyState());

        this.onMessage("*", async (client, type, data = null) => {
            switch (type) {
                case SGEvent.REQUEST_GET_PROFILE:
                    // TODO SOMETHING
                    break;
                case SGEvent.REQUEST_INVITE_FRIEND:
                    // Test 
                    InviteFriendService.inviteFriend(data);
                    break;
            }
        });
    }

    // Authorize client based on provided options before WebSocket handshake is complete
    async onAuth(client: Client, options: { accessToken: string }, request: http.IncomingMessage) {
        return await OAuthController.verifyToken(options.accessToken);
    }

    async onJoin(client: Client, options: any, auth: User) {
        try {
            let profileId = auth.profile.id || 0;
            UserManager.getInstance().kickUserByProfileId(profileId, SGCloseCode.KICK);
            UserManager.getInstance().addUser(profileId, client);
            let profileData = await ProfileService.findOrCreateProfileById(profileId);
            await QuestService.initOrUpdateQuest(profileData);
            await ProfileService.resetDailyProfile(profileData);
            await this._isOnline(profileId, true);
            INFO(`Lobby::onJoin::profileId=${profileId} join lobby success`);
        } catch (exception) {
            ERROR(`Lobby::onJoin::profileId={} join lobby failed, error=${exception}`);
        }
    }

    async onLeave(client: Client, consented: boolean) {
        let user = UserManager.getInstance().getUserByClientId(client.id);
        UserManager.getInstance().kickUser(user);
        await this._isOnline(user.profileId, false);
        console.log(`Lobby::onLeave::profileId=${user.profileId} remove from lobby. users=${UserManager.getInstance().getUsers().length}`);
    }

    onDispose() {
        // TODO Cleanup callback, called after there are no more clients in the room
    }

    update(deltaTime: number) {

    }

    async _isOnline(profile_id: number, is_onl = false) {
        let conn = await SGMySqlConnection.conn;
        let profile = await conn.getRepository(ORMProfile).findOne({
            id: profile_id
        });

        await conn.createQueryBuilder().update(ORMUser).set({
            online: is_onl
        }).where("id = :id", {id: profile.user_id}).execute();
    }
}

const subscriber = redis.createClient({
    url: env.REDIS_URL
});
subscriber.subscribe("news");
subscriber.on("message", function (channel, message) {
    let users: RoomUser[] = UserManager.getInstance().getUsers();
    if (!_.isEmpty(users) && !_.isEmpty(message)) {
        for (const user of users) {
            user.client.send(SGEvent.GLOBAL_NEWS, {
                msg_id: message
            })
        }
    }
});