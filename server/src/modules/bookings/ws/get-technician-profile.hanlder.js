import send from 
'#realtime/utils/send.js';

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
        data.technicianId
    );

    send(ws, {
        event:
            "technician_profile_success",
        data: {
            technician
        }
    });

});


export default handleGetTechnicianProfile;