import 'dotenv/config';
import Redis from 'ioredis';


const redisConnection = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    db: Number(process.env.REDIS_DB) || 0,
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    
    retryStrategy: (times) => {
        return Math.min(times * 50, 2000); // exponential backoff
    }
});

redisConnection.on("connect",()=>{
    // console.log("✅ Redis Connected");
});

redisConnection.on("error",(err)=>{
    console.error("❌ Redis Error:", err.message);
});


export default redisConnection;

