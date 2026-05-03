import 'dotenv/config';
import Redis from 'ioredis';


const redisConnection = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    db: Number(process.env.REDIS_DB) || 0,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
});

redisConnection.on("connect",()=>{
    console.log("✅ Redis Connected");
});

redisConnection.on("error",()=>{
    console.error("❌ Redis Error:", err.message);
});


export default redisConnection;

