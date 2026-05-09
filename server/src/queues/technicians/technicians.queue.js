import { Queue } from 'bullmq';
import redisConnection from '#config/redis.js';


const technicianQueue = new Queue("deleteQueue",{
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


export { 
    technicianQueue
};
