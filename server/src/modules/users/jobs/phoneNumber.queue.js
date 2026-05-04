import { Queue } from "bullmq";
import redisConnection from "#config/redis";


const phoneNumberDeleteQueue = async("phoneNumberDeleteQueue",{
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


export default phoneNumberDeleteQueue;