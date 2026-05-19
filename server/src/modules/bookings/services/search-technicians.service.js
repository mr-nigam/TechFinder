import pool from 
'#config/database/postgres.js';

import infraRedis from 
'#config/redis/infra.redis.js';

import rankTechnicians from 
'./technician-ranking.service.js';

import getAddressCoordinates from 
'../repositories/address.repo.js';

import getTechnicians from
'../repositories/get-nearby-technicians.repo.js';

import {
    geoSearch
} from '#infra';

import {
    cacheSearchResults,
    getCachedSearchPage,
    setBookingCache
} from '../bookingRedis/cache.js';


const searchNearbyTechnicians = async (
    bookingDetails
) => {

    if(bookingDetails.searchSessionId){
        return getCachedSearchPage(
            bookingDetails.searchSessionId,
            bookingDetails.page,
            bookingDetails.limit
        );
    }

    const { lng, lat, address} =
        await getAddressCoordinates(
            bookingDetails.addressId,
            bookingDetails.userId
        );

    let technicians =
        await getNearbyTechniciansFromRedis(
            lng,
            lat,
            bookingDetails.serviceCategoryId
        );
    
    if(technicians.length < 5){
        technicians = await getNearbyTechniciansFromDB(
            lng,
            lat,
            bookingDetails.serviceCategoryId
        );
    }

    if(!technicians.length){
        return [];
    }

    const searchSessionId =
        crypto.randomUUID();

    await cacheSearchResults(
        searchSessionId,
        technicians,
    );
    
    bookingDetails.lng = lng;
    bookingDetails.lat = lat;
    bookingDetails.address = address;

    const draftKey = 
        `booking_draft:${searchSessionId}`;

    await setBookingCache(
        draftKey,
        bookingDetails,
        1800
    );

    const nearbyTechs = await getCachedSearchPage(
        searchSessionId,
        bookingDetails.page,
        bookingDetails.limit
    );

    return {
        nearbyTechs,
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
     *   id: 'tech-id:ranking_score',
     *   distance: '2450.32' // meters
     * ]
     */

    const nearbyTechs = await geoSearch(
        lng,
        lat,
        serviceCategoryId
    );

    if(!nearbyTechs.length) return [];
    
    const rankedProfiles =
        rankTechnicians(nearbyTechs);

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