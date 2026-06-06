import {
    rankTechnicians
} from './index.js';

import getActiveTechnicians from
'../repositories/get-nearby-technicians.repo.js';

import {
    geoSearch
} from '#infra';


const searchActiveTechnicians = async (
    lng,
    lat,
    serviceCategoryId
) => {

    let technicians =
        await searchActiveTechniciansFromRedis(
            lng,
            lat,
            serviceCategoryId
        );

    if(technicians.length < 5){
        technicians =
            await searchActiveTechniciansFromDB(
                lng,
                lat,
                serviceCategoryId
            );
    }

    return technicians;
};

const searchActiveTechniciansFromRedis = async (
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

const searchActiveTechniciansFromDB = async (
    lng,
    lat,
    serviceCategoryId
) => {

    const technicians = await getActiveTechnicians(
        lng,
        lat,
        serviceCategoryId
    );

    const rankedProfiles =
        rankTechnicians(technicians);

    return rankedProfiles;
};


export {
    searchActiveTechnicians,
    searchActiveTechniciansFromRedis,
    searchActiveTechniciansFromDB
};