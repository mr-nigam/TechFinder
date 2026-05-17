import {
    getCache
} from '#infra';

import getTechnicianProfileFromDB  from 
'#technicians/services/get-profile.service.js';


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

    return technician;
};


export default getTechnicianProfile;