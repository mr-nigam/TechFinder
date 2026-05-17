import infraRedis from 
'#config/redis/infra.redis.js';


const getCache = async(key) => {
    try{
        const data = await infraRedis.get(key);
        return data ? JSON.parse(data) : null;
    }catch(err){
        console.error("Redis GET failed:", err.message);
        return null; // fallback safely
    }
};

const getManyCache = async (keys) => {

    const pipeline =
        infraRedis.pipeline();

    keys.forEach((key) => {
        pipeline.get(key);
    });

    const results =
        await pipeline.exec();

    return results.map(
        ([error, value]) => {

            if (error || !value) {
                return null;
            }

            try{
                return JSON.parse(value);
            }catch{
                return null;
            }
        }
    );
};

const setCache = async(
    key, 
    value, 
    ttl = 600
) => {
    try{
        await infraRedis.set(
            key,
            JSON.stringify(value),
            "EX",
            ttl
        );

        return true;

    }catch(err){
        console.error("Redis SET failed:", err.message);
        return false;
    }
};

const deleteCache = async(key) => {
    try{
        await infraRedis.del(key);
    }catch(err){
        console.error("Redis DEL failed:", err.message);
    }
};

const deleteMultipleCache = async(keys) => {
    try{
        if (!keys) return 0;

        const keyArray = Array.isArray(keys) ? keys : [keys];

        if (keyArray.length === 0) return 0;

        const deletedCount = await infraRedis.del(...keyArray);

        return deletedCount;
    }catch(err){
        console.error("Redis DEL failed:", err.message);
        return 0;
    }
};

const invalidateCaches = async (
    userId, 
    technicianId
) => {
   const cacheKeys = [
        `profile:user:${userId}`,
        technicianId && `profile:technician:${technicianId}`,
        technicianId && `dashboard:technician:${technicianId}`,
    ].filter(Boolean);

    await deleteMultipleCache(cacheKeys);
};

const geoAdd = async (
    longitude,
    latitude,
    serviceCategoryId,
    technicianId,
    ranking_score
) => {
    const key = 
        `tech:geo:${serviceCategoryId}`;

    const member = 
        `${technicianId}:${ranking_score}`;

    try{

        await infraRedis.geoAdd(
            key,
            {
                longitude: Number(longitude),
                latitude: Number(latitude),
                member: String(member)
            }
        );

        return true;
    } catch (err) {
        console.error(
            "Redis GEOADD failed:",
            err.message
        );

        return false;
    }
};

const geoSearch = async (
    lng,
    lat,
    serviceCategoryId
) => {
    const searchKey = 
        `tech:geo:${serviceCategoryId}`;

    try{
        return await infraRedis.geoSearch(
            searchKey,
            {
                longitude: Number(lng),
                latitude: Number(lat),
            },
            {
                radius: 10000,
                unit: 'm',
                WITHDIST: true,
                COUNT: 500,
                SORT: 'ASC'
            }
        );
        
    }catch(err){
        console.error(
            `[Redis GEOSEARCH Failed] key= ${searchKey}`,
            err.message
        );

        return [];
    }
};


export {
    getCache,
    getManyCache,
    setCache,
    deleteCache,
    deleteMultipleCache,
    invalidateCaches,
    geoAdd,
    geoSearch
}