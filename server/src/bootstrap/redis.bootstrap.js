import 'dotenv/config';

import bookingRedis from 
'#config/redis/booking.redis.js';

import infraRedis from 
'#config/redis/infra.redis.js';

import queueRedis from 
'#config/redis/queue.redis.js';


bookingRedis.on("ready", () => {
    console.log("✅ Booking Redis Ready");
});

infraRedis.on("ready", () => {
    console.log("✅ Infra Redis Ready");
});

queueRedis.on("ready", () => {
    console.log("✅ Queue Redis Ready");
});