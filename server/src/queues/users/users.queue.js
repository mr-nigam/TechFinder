import { Queue } from 'bullmq';
import redisConnection from '#config/redis.js';


const accountQueue = new Queue("accountQueue",{
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

const addressQueue = new Queue("addressQueue",{
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 5,
        backoff: {
            type: "exponential",
            delay: 3000
        },
        removeOnComplete: 20,
        removeOnFail: 100
    }
});

const phoneQueue = async("phoneQueue",{
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


export {
    accountQueue,
    addressQueue,
    phoneQueue
};


