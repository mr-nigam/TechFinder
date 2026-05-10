import { Worker } from 'bullmq';
import redisConnection from '#config/redis.js';
import emailHandlers from './email.handlers.js';


new Worker(
    "emailQueue",

    async (job) => {

        const handler =
            otpHandlers[job.name];

        if(!handler){
            throw new Error(
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