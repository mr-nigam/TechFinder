import {
    setBookingCache,
    getBookingCache,
    deleteBookingCache
} from '../bookingRedis/cache.js';

import {
    createBookingsRequest
} from '../repositories/index.js'

import { 
    notifyTechnician
} from '#notifications/services/index.js';

import buildBookingRequestPayload from
'../utils/booking-request.utils.js';


const sendBookingRequest = async (
    data
) => {
    const searchSessionId = 
        data.searchSessionId;

    const draftKey = 
        `booking_draft:${searchSessionId}`;
    
    const bookingDetails = await getBookingCache(
        draftKey
    );

    if(!bookingDetails){
        throw new ApiError(
            404,
            "Booking draft expired"
        );
    }

    bookingDetails.technicianId = 
        data.technicianId; 

    const bookingRequest = await 
        createBookingsRequest(
            bookingDetails
        );

    await deleteBookingCache(
        draftKey
    );

    bookingDetails.bookingRequestId = 
        bookingRequest.id;

    await setBookingCache(
        draftKey,
        bookingDetails
    );

    const technicianBookingRequest =
        buildBookingRequestPayload(
            bookingDetails,
            bookingRequest
        );

    await notifyTechnician(
        "instant_booking_request",
        technicianBookingRequest
    );
    
    return bookingDetails;
};


export default sendBookingRequest;