import 'dotenv/config';
import createRedisConnection 
from './redisFactory.js';


const queueRedis = createRedisConnection({
    host: process.env.REDIS_QUEUE_HOST,
    port: process.env.REDIS_QUEUE_PORT,
    password: process.env.REDIS_QUEUE_PASSWORD,
    db: process.env.REDIS_QUEUE_DB,

    name: "Queue Redis",

    // queues need better retry handling
    maxRetriesPerRequest: null,
});


export default queueRedis;