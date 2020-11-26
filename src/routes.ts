import express from "express";
import SGResponse from "./helpers/SGResponse";
import redis from "redis";
import env from "./env";

const router = express.Router();
const publisher = redis.createClient({
    url: env.REDIS_URL
});

router.get('/', function (req, res, next) {
    res.send(SGResponse.success('cmd', []));
});

router.post('/services/broadcast', function (req, res, next) {
    let msg_id = req.body.msg_id || "";
    publisher.publish('news', msg_id)
    res.send(SGResponse.success('cmd', []));
});

export default router;