import debug from "debug";
import UserManager from "../controllers/users/UserManager";
import { SGEvent } from "../helpers/SGEvent";

const INFO = debug('info:@services/InviteFriendService');
const ERROR = debug('error:@services/InviteFriendService');

class InviteFriendService {

    constructor() {
    }

    public inviteFriend(data: any) {
        let receiverId = data.receiverId;
        let senderName = data.senderName;
        let roomInfo = data.roomInfo;

        let receiverUser = UserManager.getInstance().getUserByProfileId(receiverId);
        if (!!receiverUser && !!receiverUser.client) {
            receiverUser.client.send(SGEvent.REQUEST_INVITE_FRIEND, {
                userName: senderName,
                roomInfo: roomInfo
            })
            INFO(`inviteFriend::senderName=${senderName}, receiverId=${receiverId}`);
        }
    }

    public connectMySQL() {
        //[scheme://][user[:[password]]@]host[:port][/schema][?attribute1=value1&attribute2=value2...
        // let connection = mysql.createConnection('mysql://ace:ace@0123123@112.140.185.158:3307/acepoker_games');
        // connection.connect((error: MysqlError, args: any[]) => {
        //     console.log(error, args);
        //     connection.query(`SELECT * FROM game_rooms WHERE id = 128`, 
        //     (err: MysqlError | null, results?: any, fields?: mysql.FieldInfo[]) => {
        //         console.log(`err=${err} | result=${JSON.stringify(results)}`);
        //     })
        // });

    }
}

export default new InviteFriendService();
