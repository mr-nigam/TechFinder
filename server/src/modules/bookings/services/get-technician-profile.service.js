import getTechnicianProfileFromDB  from 
'#technicians/services/get-profile.service.js';

import {
    setCache,
    getCache
} from '#infra';

import { 
    ApiError 
} from '#shared';



const getTechnicianProfile = async (
    technicianId
) => {
    const cacheKey =
        `tech:profile:${technicianId}`;

    let technician = null;

    try{
        technician = await getCache(
            cacheKey
        );
    }catch {}

    if(!technician){
        technician =
            await getTechnicianProfileFromDB(
                technicianId
            );
    }
    
    if(!technician){
        throw new ApiError(
            400,
            "Technician not available"
        )
    }

    const profileCacheTTL = 120 * 60; // 2 hour

    await setCache(
        cacheKey,
        technician,
        profileCacheTTL
    )

    return technician;
};


export default getTechnicianProfile;