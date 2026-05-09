import { Worker } from 'bullmq';
import redisConnection from '#config/redis.js';
import cleanupHandlers from './cleanup.handlers';


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
        connection: redisConnection,
        concurrency: 5
    }
);
