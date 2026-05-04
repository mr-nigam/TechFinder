import { Queue } from 'bullmq';
import redisConnection from '#config/redis';


const accountDeletionQueue = new Queue("accountDeletionQueue",{
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 10,
        backoff: {
            type: "exponential",
            delay: 3000
        },
        removeOnComplete: 50,
        removeOnFail: 100,
        delay: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
    },
});


export default accountDeletionQueue;