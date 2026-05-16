import pool from 
'#config/database/postgres.js';

import infraRedis from 
'#config/redis/infra.redis.js';

import rankTechnicians from 
'./technician-ranking.service.js';

import mapTechnicianProfiles from
'../mappers/technician.mapper.js';

import {
    ApiError
} from '#shared';

import {
    geoSearch
} from '#infra';


const MAX_DISTANCE_METERS = 10000; // 10km

const searchNearbyTechnicians = async (
    userId,
    bookingData
) => {

    const { lng, lat } =
    await getAddressCoordinates(
        bookingData.addressId,
        userId
    );

    /**
     * Expected format from geoSearch:
     * [
     *   id: 'tech-id',
     *   distance: '2450.32' // meters
     * ]
     */

    const nearbyTechs = await geoSearch(
        bookingData.serviceCategoryId,
        lng,
        lat
    );

    if(!nearbyTechs.length) return [];

    const pipeline = infraRedis.pipeline();

    nearbyTechs.forEach(({ id }) => {
        pipeline.get(`tech:profile:${id}`);
    });

    const redisResults = await pipeline.exec();

    const profiles = mapTechnicianProfiles(
        redisResults,
        nearbyTechs
    );
    
    const rankedProfiles =
        rankTechnicians(profiles);

    return rankedProfiles;
};


export default searchNearbyTechnicians;