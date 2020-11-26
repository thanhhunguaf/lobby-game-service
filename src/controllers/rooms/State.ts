import { MapSchema, Schema, type } from "@colyseus/schema";

export class UserState extends Schema {
    @type("string")
    sessionId: string
    @type("number")
    profileId: number
    @type("number")
    clientId: number
}

export class LobbyState extends Schema {
    @type({map: UserState})
    userMapByClientId = new MapSchema<UserState>();
    @type({map: UserState})
    userMapByProfileId = new MapSchema<UserState>();
    @type({map: UserState})
    userMapBySessionId = new MapSchema<UserState>();
}