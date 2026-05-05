import redisConnection from '#config/redis';


const getCache = async(key) => {
    try{
        const data = await redisConnection.get(key);
        return data ? JSON.parse(data) : null;
    }catch(err){
        console.error("Redis GET failed:", err.message);
        return null; // fallback safely
    }
};

const setCache = async(key, value, ttl = 600) => {
    try{
        await redisConnection.set(key, JSON.stringify(value), "EX", ttl);
    }catch(err){
        console.error("Redis SET failed:", err.message);
    }
};

const deleteCache = async(key) => {
    try{
        await redisConnection.del(key);
    }catch(err){
        console.error("Redis DEL failed:", err.message);
    }
};

const deleteMultipleCache = async(keys) => {
    try{
        if (!keys) return 0;

        const keyArray = Array.isArray(keys) ? keys : [keys];

        if (keyArray.length === 0) return 0;

        const deletedCount = await redisConnection.del(...keyArray);

        return deletedCount;
    }catch(err){
        console.error("Redis DEL failed:", err.message);
        return 0;
    }
};


export {
    getCache,
    setCache,
    deleteCache,
    deleteMultipleCache
}