import { Queue } from 'bullmq';

import bookingRedis from 
'#config/redis/booking.redis.js';


const emergencyBookingAcceptanceQueue = new Queue (
    "emergencyBookingAcceptanceQueue",
    {
        connection: bookingRedis,

         defaultJobOptions: {

            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 2000
            },

            removeOnComplete: 50,
            removeOnFail: 50
        }
    }
);


export default emergencyBookingQueue;