import validateBookingData from 
'../validator/booking.validate.js';

import instantTechnicianSearch from 
'../services/instant-technician-search.service.js';

import sendRealtime from 
'#realtime/utils/send.realtime.js';

import { 
    asyncHandler
} from '#shared';


const handleInstantTechnicianSearch = 
asyncHandler(async (ws, data) => { 
    
    const user = ws.user;

    const bookingDetails = 
        validateBookingData(data);
    
    bookingDetails.userId = user.id;
    bookingDetails.customerPhone = user.phone;

    const {
        technicians,
        searchSessionId
    } = 
        await searchInstantNearbyTechnicians(
            bookingDetails
        );
    
    // No technicians found
    if(!technicians.length){
        return send(ws, {
            event: "no_instant_nearby_technicians_found",
            data: {
                technicians: []
            }
        });
    }

    sendRealtime(ws, {
        event: "technician_search_success",
        data: {
            bookingType: "instant",
            searchSessionId,
            total: technicians.length,
            technicians
        }
    });

});


export default handleInstantTechnicianSearch;
