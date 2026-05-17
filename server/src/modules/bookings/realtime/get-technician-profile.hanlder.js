import sendRealtime from 
'#realtime/utils/send.realtime.js';

import {
    asyncHandler,
    ApiError
} from '#shared';

import getTechnicianProfile from 
'../services/get-technician-profile.service.js';


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

    const technician = await getTechnicianProfile(
        technicianId
    );

    sendRealtime(ws, {
        event:
            "technician_profile_success",
        data: {
            technician
        }
    });
});


export default handleGetTechnicianProfile;