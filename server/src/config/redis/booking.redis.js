import 'dotenv/config';
import createRedisConnection from 
'./redisFactory.js';


const bookingRedis = createRedisConnection({
    host: process.env.REDIS_BOOKING_HOST,
    port: process.env.REDIS_BOOKING_PORT,
    password: process.env.REDIS_BOOKING_PASSWORD,
    db: process.env.REDIS_BOOKING_DB,
    name: "Booking Redis",
    maxRetriesPerRequest: null,
});

export default bookingRedis;