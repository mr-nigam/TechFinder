import { Queue } from 'bullmq';
import redisConnection from '#config/redis';


const otpQueue = new Queue("otpQueue", {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 2,
        backoff: {
            type: "fixed",
            delay: 1000
        },
        removeOnComplete: 50,
        removeOnFail: 100
    }
});

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


export {
    otpQueue,
    emailQueue
};