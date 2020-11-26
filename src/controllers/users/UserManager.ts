import { Client } from "colyseus";
import ErrorCode from "../../common/ErrorCode";
import RoomUser from "./RoomUser";

export default class UserManager {
    private static instance: UserManager;
    public static getInstance(): UserManager {
        if (!this.instance) {
            this.instance = new UserManager();
        }
        return this.instance;
    }

    private usersByProfileId: Map<number, RoomUser> = new Map();
    private usersByClientId: Map<string, RoomUser> = new Map();
    private users: RoomUser[] = [];


    public addUser(profileId: number, client: Client): ErrorCode {
        if (this.usersByProfileId.has(profileId)) {
            return ErrorCode.UC_SAME_PROFILEID;
        }
        if (this.usersByClientId.has(client.id)) {
            return ErrorCode.UC_SAME_CLIENT;
        }
        let user = new RoomUser(profileId, client);
        this.usersByProfileId.set(profileId, user);
        this.usersByClientId.set(client.id, user);
        this.users.push(user);
        return ErrorCode.SUCCESS;
    }

    public kickUser(user: RoomUser, reasonCode?: number, reasonParams?: string) {
        if (!!user) {
            let index = this.users.indexOf(user);
            if (index >= 0) {
                this.users.splice(index, 1);
                this.usersByClientId.delete(user.client.id);
                this.usersByProfileId.delete(user.profileId);
                user.client.leave(reasonCode, reasonParams);
            }
        }
    }

    public kickUserByProfileId(profileId: number, reasonCode?: number, reasonParams?: string) {
        this.kickUser(this.getUserByProfileId(profileId), reasonCode, reasonParams);
    }

    public kickUserByClientId(sessionId: string, reasonCode?: number, reasonParams?: string) {
        this.kickUser(this.getUserByClientId(sessionId), reasonCode, reasonParams);
    }

    //#region UTILS
    public getUsers(): RoomUser[] {
        return [...this.users];
    }

    public getUserByProfileId(profileId: number): RoomUser {
        return this.usersByProfileId.get(profileId) || null;
    }

    public getUserByClientId(clientId: string): RoomUser {
        return this.usersByClientId.get(clientId) || null;
    }
    //#endregion
}