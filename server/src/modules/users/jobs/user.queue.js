import { Queue } from 'bullmq';
import redisConnection from '#config/redis';


const userQueue = new Queue("userQueue", {
  connection: redisConnection,
});


export default userQueue;