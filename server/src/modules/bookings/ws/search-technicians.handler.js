import validateBookingData from 
'../validator/booking.validate.js';

import searchNearbyTechnicians from 
'../services/search-technicians.service.js';

import send from
'#realtime/utils/send.js';

import { 
    asyncHandler,
    ApiError
} from '#shared';


const handleSearchTechnicians = asyncHandler(async (ws,data) => { 
    const user = ws.user;

    const bookingData = 
        validateBookingData(data);
    
    const technicians = 
        await searchNearbyTechnicians(
            user.id,
            bookingData
        );
    
    // No technicians found
    if(!technicians.length){
        send(ws, {
            event:
                "No nearby technicians found",
            data: {
                technicians: []
            }
        });
    }

    send(ws, {
        event: "search_technicians_success",
        data: {
            total: technicians.length,
            technicians
        }
    });
});


export {
    handleSearchTechnicians
};
