import bookingRedis from 
'#config/redis/booking.redis.js';

import {
    getManyCache
} from '#infra';

const profileCard = (profile)=>{
    return {
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        specialization: profile.specialization,
        experience_years: profile.experience_years,
        hourly_rate: profile.hourly_rate,
        profile_picture_url: profile.profile_picture_url,
        service_category_id: profile.service_category_id,
        average_rating: profile.average_rating,
        ranking_score: profile.ranking_score,
        total_reviews:  profile.total_reviews,
        distance_meters: profile.distance_meters,
    };
}

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
        300
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

    const results = await pipeline.exec();

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

export {
    cacheSearchResults,
    getCachedSearchPage       
};
