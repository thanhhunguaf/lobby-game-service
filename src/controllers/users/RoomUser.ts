import { Client } from "colyseus";

export default class RoomUser {
    public profileId: number;
    public client: Client;

    constructor(profileId: number, client: Client) {
        this.profileId = profileId;
        this.client = client;
    }
}