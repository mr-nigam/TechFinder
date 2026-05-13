import { Queue } from 'bullmq';
import queueRedis from 
'#config/redis/queue.redis.js';


const notificationQueue = new Queue(
    "notificationQueue",
    {
        connection: queueRedis,
        defaultJobOptions: {
            attempts: 5,
            backoff: {
                type: "exponential",
                delay: 3000
            },
            removeOnComplete: 20,
            removeOnFail: 200
        }
    }
);


export default notificationQueue;





/*
booking-confirmed
booking-cancelled
new-booking
payment-success
technician-approved
promotion
security-alert

delete-expired-notifications

metadata: {
    bookingId,
    technicianId,
    serviceId
}
*/  