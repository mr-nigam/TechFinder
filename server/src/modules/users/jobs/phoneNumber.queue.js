import { Queue } from "bullmq";
import redisConnection from "#config/redis";


const phoneNumberQueue = async("phoneNumberQueue",{
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

