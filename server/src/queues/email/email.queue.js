import { Queue } from 'bullmq';
import queueRedis from 
'#config/redis/queue.redis.js';


const emailQueue = new Queue(
    "emailQueue",
    {
        connection: queueRedis,
        defaultJobOptions: {
            attempts: 5,
            backoff: {
                type: "exponential",
                delay: 3000
            },
            removeOnComplete: 20,
            removeOnFail: 200
        }
    }
);


export default emailQueue;