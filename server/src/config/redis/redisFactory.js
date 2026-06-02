import Redis from 'ioredis';


const createRedisConnection = ({
    host,
    port,
    password,
    db = 0,
    name = "Redis",
    maxRetriesPerRequest = 3,
}) => {

    const redis = new Redis({
        host,
        port: Number(port),
        password: password || undefined,
        db: Number(db),

        maxRetriesPerRequest,

        enableReadyCheck: false,

        retryStrategy: (times) => {
            return Math.min(times * 100, 3000);
        },

        reconnectOnError: (err) => {
            console.error(`❌ ${name} reconnect error:`, err.message);
            return true;
        },
    });

    redis.on("connect", () => {
        console.log(`✅ ${name} Connected`);
    });

    redis.on("ready", () => {
        console.log(`🚀 ${name} Ready`);
    });

    redis.on("error", (err) => {
        console.error(`❌ ${name} Error:`, err.message);
    });

    redis.on("close", () => {
        console.warn(`⚠️ ${name} Connection Closed`);
    });

    redis.on("reconnecting", () => {
        console.warn(`🔄 ${name} Reconnecting...`);
    });

    return redis;
};


export default createRedisConnection;