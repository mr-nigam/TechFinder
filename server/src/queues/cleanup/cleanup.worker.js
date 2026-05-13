import { Worker } from 'bullmq';
import cleanupHandlers from './cleanup.handlers';

import queueRedis from 
'#config/redis/queue.redis.js';


new Worker(
    "cleanupQueue",

    async(job) => {
        const handler =
            cleanupHandlers[job.name];
        
        if(!handler){
            throw new ApiError(
                500,
                `Unknown job: ${job.name}`
            );
        }
        
        await handler(job.data);
    },
    {
        connection: queueRedis,
        concurrency: 5
    }
);
