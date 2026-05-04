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
    },
});


export default accountDeletionQueue;