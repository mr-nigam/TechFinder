import { Worker } from 'bullmq';
import emailHandlers from './email.handlers.js';

import queueRedis from 
'#config/redis/queue.redis.js';


new Worker(
    "emailQueue",

    async (job) => {

        const handler =
            emailHandlers[job.name];

        if(!handler){
            throw new Error(
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