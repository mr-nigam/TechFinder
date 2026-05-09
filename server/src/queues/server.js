import 'dotenv/config';
import redisConnection from '#config/redis.js';


// console.log("🚀 Worker Server Started");


redisConnection.on("ready", () => {
    console.log("✅ Redis Ready");
});