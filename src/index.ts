import { mongoose } from "@colyseus/social";
import { RedisPresence, Server } from "colyseus";
import { MongooseDriver } from "colyseus/lib/matchmaker/drivers/MongooseDriver";
import cors from "cors";
import express from "express";
import http from "http";
import "reflect-metadata";
import { Lobby } from "./controllers/rooms/Lobby";
import env from "./env";
import router from "./routes";
import AmqpService from './services/AmqpService';

const port = Number(env.PORT || 2567);
const app = express()

app.use(cors());
app.use(express.json())

mongoose.set('debug', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true);

const server = http.createServer(app);
const gameServer = new Server({
    server,
    presence: new RedisPresence({
        url: env.REDIS_URL
    }),
    driver: new MongooseDriver(),
});

app.use("/", router);
gameServer.define("lobby", Lobby);
gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`)

AmqpService.start();