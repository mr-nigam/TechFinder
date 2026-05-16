import pool from 
'#config/database/postgres.js';

import infraRedis from 
'#config/redis/infra.redis.js';

import rankTechnicians from 
'./technician-ranking.service.js';

import mapTechnicianProfiles from
'../mappers/technician.mapper.js';

import getAddressCoordinates from 
'../repositories/address.repos.js';

import getTechnicians from
'../repositories/get-nearby-technicians.repo.js';

import {
    geoSearch
} from '#infra';

import {
    cacheSearchResults,
    getCachedSearchPage  
} from '../bookingRedis/cache.js';


const searchNearbyTechnicians = async (
    userId,
    bookingData
) => {

    if(bookingData.searchSessionId){
        return getCachedSearchPage(
            bookingData.searchSessionId,
            bookingData.page,
            bookingData.limit
        );
    }

    const { lng, lat } =
        await getAddressCoordinates(
            bookingData.addressId,
            userId
        );

    let technicians =
        await getNearbyTechniciansFromRedis(
            lng,
            lat,
            bookingData.serviceCategoryId
        );
    
    if(technicians.length < 5){
        technicians = await getNearbyTechniciansFromDB(
            lng,
            lat,
            bookingData.serviceCategoryId
        );
    }

    if(!technicians.length){
        return [];
    }

    const searchSessionId =
        crypto.randomUUID();

    await cacheSearchResults(
        searchSessionId,
        technicians
    );

    const data = await getCachedSearchPage(
        searchSessionId,
        bookingData.page,
        bookingData.limit
    );

    return {
        data,
        searchSessionId
    };
};

const getNearbyTechniciansFromRedis = async (
    lng,
    lat,
    serviceCategoryId
) => {

    /**
     * Expected format from geoSearch:
     * [
     *   id: 'tech-id',
     *   distance: '2450.32' // meters
     * ]
     */

    const nearbyTechs = await geoSearch(
        serviceCategoryId,
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

const getNearbyTechniciansFromDB = async (
    lng,
    lat,
    serviceCategoryId
) => {

    const technicians = await getTechnicians(
        lng,
        lat,
        serviceCategoryId
    );

    const rankedProfiles =
        rankTechnicians(technicians);

    return rankedProfiles;
};


export default searchNearbyTechnicians; 