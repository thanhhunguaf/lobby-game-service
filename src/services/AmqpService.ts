import * as Amqp from "amqp-ts";
import Utils from "../common/Utils";
import env from "../env";
import debug from "debug";
import FeatureGameManager from "../features/game/FeatureGameManager";
import {message_bjk, message_cpk, message_tour_phk, message_tour_txh, message_txh} from "../test/DataTest";

const ERROR = debug("error:@service/AmqpService");
const INFO = debug("info:@service/AmqpService");

const MAX_WORKER = 10;

export class AmqpService {
    private readonly _conn: string;
    private readonly _exchange: string;
    private readonly _queue: string;
    private readonly _router: string;
    private readonly _workers: AmqpWorker[];
    private _started: boolean;

    private _workerSender: AmqpWorker;

    get workers(): AmqpWorker[] {
        return this._workers;
    }

    constructor(conn: string, exchange: string, queue: string, router?: string) {
        this._workers = [];
        this._conn = conn;
        this._exchange = exchange;
        this._queue = queue;
        this._router = router;
        this._started = false;

        // this._workerSender = new AmqpWorker(9999, this._conn, this._exchange, this._queue, this._router);
        // setTimeout(() => {
        //     this._workerSender.send(new Amqp.Message(message_txh), 'service');
        // }, 2000);
        //
        // setTimeout(() => {
        //     this._workerSender.send(new Amqp.Message(message_cpk), 'service');
        // }, 3000);
        //
        // setTimeout(() => {
        //     this._workerSender.send(new Amqp.Message(message_bjk), 'service');
        // }, 4000);
        //
        // setTimeout(() => {
        //     this._workerSender.send(new Amqp.Message(message_tour_phk), 'service');
        // }, 5000);
        //
        // setTimeout(() => {
        //     this._workerSender.send(new Amqp.Message(message_tour_txh), 'service');
        // }, 6000);
    }

    public start(): void {
        if (this._started) {
            ERROR(`AMQP service already started!`);
            return;
        }
        this._started = true;
        INFO(`
            - Connecting to AMQP: ${this._conn} 
            - Exchange: ${this._exchange} 
            - Queue: ${this._queue} 
            - Router: ${this._router} 
            - Started: ${this._started}
        `);
        try {
            for (let i = 0; i < MAX_WORKER; i++) {
                let worker: AmqpWorker = new AmqpWorker(i, this._conn, this._exchange, this._queue, this._router);
                worker.onMessageHandler = this.onMessageHandler.bind(this);
                this._workers.push(worker);
            }
        } catch (error) {
            throw error;
        }
    }

    public async onMessageHandler(message: Amqp.Message) {
        await FeatureGameManager.onMessage(message);
    }

    public stop(): void {
        if (this._workers && this._workers.length > 0) {
            this._workers.forEach(worker => worker.stop());
        }
        INFO('Connect to AMQP was stopped');
        this._started = false;
    }
}

export class AmqpWorker {
    private readonly _id: number;
    private readonly _connection: Amqp.Connection;
    private readonly _exchange: Amqp.Exchange;
    private readonly _queue: Amqp.Queue;
    private _working: boolean;
    private _onMessageHandler: (message: Amqp.Message) => void;

    public get id(): number {
        return this._id;
    }

    public get connection(): Amqp.Connection {
        return this._connection;
    }

    public get exchange(): Amqp.Exchange {
        return this._exchange;
    }

    public get queue(): Amqp.Queue {
        return this._queue;
    }

    public get working(): boolean {
        return this._working;
    }

    public set onMessageHandler(func: (message: Amqp.Message) => void) {
        this._onMessageHandler = func;
    }

    constructor(id: number, conn: string, exchange: string, queue: string, router?: string) {
        if (!Utils.hasText(conn) ||
            !Utils.hasText(exchange) ||
            !Utils.hasText(queue)) {
            ERROR(`Can't create worker with conn=${conn} - exchange=${exchange} - queue: ${queue}`);
            throw `Can't create worker with conn=${conn} - exchange=${exchange} - queue: ${queue}`;
        }
        this._id = id;
        this._connection = new Amqp.Connection(conn);
        this._exchange = this._connection.declareExchange(exchange, "direct", {durable: true});
        this._queue = this._connection.declareQueue(queue, {durable: true, prefetch: 100});
        this._queue.bind(this._exchange, router);
        this._queue.activateConsumer(this.onMessage.bind(this));
        this._working = false;
        this._connection.completeConfiguration().then(() => {
            INFO(`Worker ${this.id} started!`);
            this._working = true;
        });
        this._connection
            .on('open_connection', this.onOpenConnection.bind(this))
            .on('close_connection', this.onCloseConnection.bind(this))
            .on('lost_connection', this.onLostConnection.bind(this))
            .on('re_established_connection', this.onReconnection.bind(this))
            .on('error_connection', this.onErrorConnection.bind(this));
    }

    //#region HANDLE EVENT
    private onMessage(message: Amqp.Message) {
        if (this._onMessageHandler) {
            this._onMessageHandler(message);
        }
    }

    private onOpenConnection(): void {
        this._working = true;
        INFO(`Worker ${this.id} connected`);
    }

    private onCloseConnection(): void {
        this._working = false;
        INFO(`Worker ${this.id} lose!`);
    }

    private onLostConnection(): void {
        this._working = false;
        INFO(`Worker ${this.id} lost!`);
    }

    private onReconnection(): void {
        this._working = true;
        INFO(`Worker ${this.id} restarted!`);
    }

    private onErrorConnection(error: string) {
        this._working = false;
        ERROR(`Worker ${this.id} start error: ${error}`);
    }

    // endregion

    public send(message: Amqp.Message, routerKey = "") {
        if (!this.working) {
            //connect fail
            ERROR(`Cannot send message: ${message}, server not start`);
            return;
        }
        if (message instanceof Amqp.Message) {
            this.exchange.send(message, routerKey);
        }
    }

    public stop() {
        if (this.connection) {
            this.connection.close().then(r => INFO(`Workers id: ${this.id} had been stopped`));
        }
    }
}

export default new AmqpService(env.RBMQ_PLATFORM_HOST,
    env.RBMQ_PLATFORM_EXCHANGE,
    env.RBMQ_PLATFORM_QUEUE,
    env.RBMQ_PLATFORM_ROUTER);