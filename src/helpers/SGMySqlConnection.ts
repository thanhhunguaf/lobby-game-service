import {createConnection, getConnection} from "typeorm";
import env from "../env";
import {ORMProfile} from "../entities/ORMProfile";
import {ORMUser} from "../entities/ORMUser";
import debug from "debug";

const INFO = debug('info:@helper/SGConnection');
const ERROR = debug('error:@helper/SGConnection');

class SGMySqlConnection {
    get conn(): any {
        return this._conn;
    }

    set conn(value: any) {
        this._conn = value;
    }

    private _conn: any = null;

    constructor() {
        try {
            this._conn = getConnection();
        } catch (e) {
            createConnection({
                "type": "mysql",
                "host": env.MYSQL_HOST,
                "port": parseInt(env.MYSQL_PORT),
                "username": env.MYSQL_USERNAME,
                "password": env.MYSQL_PASSWORD,
                "database": env.MYSQL_DBNAME,
                "synchronize": false,
                "logging": false,
                "entities": [ORMProfile, ORMUser]
            }).then(connection => {
                INFO(`
            - MySQL connecting to:
                + Host: ${env.MYSQL_HOST},
                + Port: ${env.MYSQL_PORT}
                + Username: ${env.MYSQL_USERNAME}
                + Db: ${env.MYSQL_DBNAME}
            `)
                this.conn = connection;
            }).catch(error => ERROR(`MySQL create connection error: ${error}`))
        }
    }
}

export default new SGMySqlConnection();