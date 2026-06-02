import pool from 
'#config/database/postgres.js';

import {
    ApiError,
} from '#shared';

import {
    setCache,
    geoAdd
} from '#infra';

import validateTechnicianStatus from 
'./validate-technician-status.service.js';

import getProfileData from 
'../repositoris/get-profile.repo.js';

import getCoordinates from 
'../repositoris/get-coordinates.repo.js';


const getTechnicianProfileFromDB = async(
    technicianId
) => {

    const technician = await getProfileData(
        technicianId
    );

    validateTechnicianStatus(
        technician
    );

    const coordinates = await getCoordinates(
        technicianId
    );

    const profileCacheKey =
        `tech:profile:${technicianId}`;

    const profileCacheTTL = 120 * 60; // 2 hour

    await Promise.allSettled([
        setCache(
            profileCacheKey,
            technician,
            profileCacheTTL
        ),

        geoAdd(
            Number(coordinates.longitude),
            Number(coordinates.latitude),
            technician.service_category_id,
            technicianId,
            technician.ranking_score
        )
    ]);

    return technician;
};


export default getTechnicianProfileFromDB;