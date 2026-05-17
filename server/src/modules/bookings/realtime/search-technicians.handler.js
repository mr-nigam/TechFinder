import validateBookingData from 
'../validator/booking.validate.js';

import searchNearbyTechnicians from 
'../services/search-technicians.service.js';

import sendRealtime from 
'#realtime/utils/send.realtime.js';

import { 
    asyncHandler
} from '#shared';


const handleSearchTechnicians = 
asyncHandler(async (ws, data) => { 

    const bookingData = 
        validateBookingData(data);
    
    bookingData.userId = ws.user.id;

    const {
        nearbyTechnicians,
        searchSessionId
    } = 
        await searchNearbyTechnicians(
            bookingData
        );
    
    // No technicians found
    if(!nearbyTechnicians.length){
        return send(ws, {
            event: "no_nearby_technicians_found",
            data: {
                technicians: []
            }
        });
    }

    sendRealtime(ws, {
        event: "search_technicians_success",
        data: {
            total: technicians.length,
            data: {
                technicians: nearbyTechnicians,
                searchSessionId: searchSessionId,
            }
        }
    });

});


export default handleSearchTechnicians;
