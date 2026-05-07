import { Queue } from 'bullmq';
import redisConnection from '#config/redis';


const cloudinaryDeleteQueue = new Queue("deleteFromCloudinary",{
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


export default cloudinaryDeleteQueue;