import { Queue } from 'bullmq';

import redisConnection 
from '#config/redis.js';


const cleanupQueue = new Queue(
    "cleanupQueue",
    {
        connection: redisConnection,

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