import bookingRedis from 
'#config/redis/booking.redis.js';

import profileCard from 
'../utils/profile-cards.util.js';

import {
    getManyCache
} from '#infra';


const cacheSearchResults = async(
    searchSessionId,
    technicians
)=>{
    const key = 
        `search:tech:${searchSessionId}`;

    if(!technicians.length){
        return;
    }

    const technicianIds =
        technicians.map((tech) => tech.id);

    const pipeline =
        bookingRedis.pipeline();

    pipeline.del(key);

    pipeline.rpush(
        key,
        ...technicianIds
    );

    pipeline.expire(
        key,
        1800
    );

    await pipeline.exec();
};

const getCachedSearchPage = async(
    searchSessionId,
    page,
    limit
)=>{
    const {
        total,
        totalPages, 
        technicianIds
    } = await getCachedIds(
        searchSessionId,
        page,
        limit
    );

    const profiles = await getManyCache(
        technicianIds.map(
        (id) => `tech:profile:${id}`
        )
    );

    const profileCards = profiles
        .filter(Boolean)
        .map(profileCard);
    
    return {
        page,
        limit,
        total,
        totalPages,
        technicians: profileCards
    };

};

const getCachedIds = async(
    searchSessionId,
    page,
    limit
)=>{
    const key = 
        `search:tech:${searchSessionId}`;

    const start = (page-1)*limit;
    const end = page*limit-1;

    const pipeline = 
        bookingRedis.pipeline();

    pipeline.lrange(
        key,
        start,
        end
    );

    pipeline.llen(key);

    const results = 
        await pipeline.exec();

    const technicianIds =
        results[0][1] || [];

    const total =
        results[1][1] || 0;

    return {
        total,
        totalPages: Math.ceil(
            total / limit
        ),
        technicianIds
    };
};

const getBookingCache = async(key) => {
    try{
        const data = await bookingRedis.get(key);
        return data ? JSON.parse(data) : null;
    }catch(err){
        console.error("Redis GET failed:", err.message);
        return null; // fallback safely
    }
};

const setBookingCache = async(
    key, 
    value, 
    ttl = 900
) => {
    try{
        await bookingRedis.set(
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

const deleteBookingCache = async(key) => {
    try{
        await bookingRedis.del(key);
    }catch(err){
        console.error("Redis DEL failed:", err.message);
    }
};

const setLock = async(
    key,
    lockValue,
    ttl = 10
) =>{
    try{
        const result = await bookingRedis.set(
            key,
            JSON.stringify(val),
            "NX",
            "EX",
            ttl
        );

        return result === "OK";
    
    }catch(err){
        console.log(`Set Lock Redis Error: ${err}`);

        throw Error(
            err.message || "redis lock failed"
        );
    }
}

const releaseLock = async(
    key,
    lockValue
) => {
    
    try{
        const curent = 
            await bookingRedis.get(key);

        if(curent === lockValue){
            await bookingRedis.del(key);
            
            return true;
        }

        return false;
    }catch(err){
        console.log(`Release Lock Redis Error: ${err}`);

        throw Error(
            err.message || "redis release lock failed"
        );
    }

}


export {
    cacheSearchResults,
    getCachedSearchPage,
    getBookingCache,
    setBookingCache,
    deleteBookingCache,
    setLock,
    releaseLock
};