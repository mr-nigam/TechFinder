import { Worker } from 'bullmq';
import otpHandlers from './otp.handlers.js';

import infraRedis from 
'#config/redis/infra.redis.js';


new Worker(
    "otpQueue",
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
        connection: infraRedis,
        concurrency: 5
    }
);