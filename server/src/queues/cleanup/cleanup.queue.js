import { Queue } from 'bullmq';

import queueRedis from 
'#config/redis/queue.redis.js';


const cleanupQueue = new Queue(
    "cleanupQueue",
    {
        connection: queueRedis,

        defaultJobOptions: {

            attempts: 5,
            backoff: {
                type: "exponential",
                delay: 3000
            },

            removeOnComplete: 50,
            removeOnFail: 100
        }
    }
);


export default cleanupQueue;