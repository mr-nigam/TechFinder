import { Queue } from 'bullmq';

import infraRedis from 
'#config/redis/infra.redis.js';


const otpQueue = new Queue(
    "otpQueue",
    {
        connection: infraRedis,
        defaultJobOptions: {
            attempts: 2,
            backoff: {
                type: "fixed",
                delay: 1000
            },
            removeOnComplete: 50,
            removeOnFail: 100
        }
    }
);


export default otpQueue;