import pool from 
'#config/database/postgres.js';

import {
    ApiError,
} from '#shared';

import {
    setCache,
    geoAdd
} from '#infra';

import {
    validateTechnicianStatus
} from './validate-technician-status.js';

import {
    getProfileData
} from '../repositoris/get-profile.repo.js';

import {
    getCoordinates
} from '../repositoris/get-coordinates.repo.js';


const getTechnicianProfile = async(
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

    const categoryId = technician.service_category_id;

    const geoKey =
        `tech:geo:${categoryId}`;
    
    const profileCacheTTL = 120 * 60; // 1 hour

    await Promise.allSettled([
        setCache(
            profileCacheKey,
            technician,
            profileCacheTTL
        ),

        geoAdd(
            geoKey,
            Number(coordinates.longitude),
            Number(coordinates.latitude),
            technicianId
        )
    ]);

    return technician;
};


export default getTechnicianProfile;