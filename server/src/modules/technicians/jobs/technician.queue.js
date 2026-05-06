import { Queue } from 'bullmq';
import redisConnection from '#config/redis';


const emailQueue = new Queue("emailQueue", {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 5,
        backoff: {
            type: "exponential",
            delay: 3000
        },
        removeOnComplete: 20,
        removeOnFail: 200
    }
});

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
    emailQueue,
    technicianQueue
};