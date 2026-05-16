import send from 
'#realtime/utils/send.js';

import {
    asyncHandler,
    ApiError
} from '#shared';

import {
    getCache
} from '#infra';

import {
    getTechnicianProfile
} from '#technicians/services/get-profile.service.js';


const handleGetTechnicianProfile =
asyncHandler(async (ws, data) => {

    const technicianId =
        data.technicianId;

    if (!technicianId) {
        throw new ApiError(
            400,
            "Technician ID is required"
        );
    }

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
            await getTechnicianProfile(
                technicianId
            );
    }

    send(ws, {
        event:
            "technician_profile_success",
        data: {
            technician
        }
    });

});


export {
    handleGetTechnicianProfile
};