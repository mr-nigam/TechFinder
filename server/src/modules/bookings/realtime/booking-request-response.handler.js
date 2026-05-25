import sendRealtime from 
'#realtime/utils/send.realtime.js';

import {
    asyncHandler,
    ApiError
} from '#shared';

import {
    acceptBooking,
    rejectBooking
} from '../services/index.js';


const handleBookingRequestResponse = 
asyncHandler( async (ws, data) => { 
    const technician = ws.technician;

    const response = data.response?.trim() || null;
    let result = "";
    
    if(response === "accepted"){
        result = await acceptBooking(
            ws,
            data,
            technician
        );

    }else if(response === "rejected"){
        result = await rejectBooking(
            ws,
            data,
            technician
        );

    }else{
        throw new ApiError(
            400,
            "Invalid response"
        );
    }
});


export default handleBookingRequestResponse; 