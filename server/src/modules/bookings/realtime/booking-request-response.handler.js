import sendRealtime from 
'#realtime/utils/send.realtime.js';

import {
    asyncHandler,
    ApiError
} from '#shared';

const handleBookingRequestResponse = 
asyncHandler( async (ws, data) => { 
    const technician = ws.technician;

    const response = data.response?.trim() || null;
    let result = "";
    
    if(response === "accepted"){

        result = await acceptBooking(
            technician,
            data
        );

    }else if(response === "rejected"){
        result = await rejectBooking(
            technician,
            data
        );

    }else{
        throw new ApiError(
            400,
            "Invalid response"
        );
    }
});


export default handleBookingRequestResponse; 