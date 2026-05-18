import {
    setBookingCache,
    getBookingCache,
    deleteBookingCache
} from '../bookingRedis/cache.js';

import createBookingsRequest from 
'../repositories/create-booking.repo.js'

import notifyTechnician from
'#notifications/services/notify-technician.service.js';


const sendBookingRequest = async (
    data
) => {
    const searchSessionId = 
        data.searchSessionId;

    const draftKey = 
        `booking_draft:${searchSessionId}`;
    
    const bookingData = await getBookingCache(
        draftKey
    );

    if(!bookingData){
        throw new ApiError(
            404,
            "Booking draft expired"
        );
    }

    bookingData.technicianId = 
        data.technicianId; 

    const bookingRequestId = await 
        createBookingsRequest(
            bookingData
        );

    await deleteBookingCache(
        draftKey
    );

    bookingData.bookingRequestId = 
        bookingRequestId;

    await setBookingCache(
        draftKey,
        bookingData
    );

    await notifyTechnician({
        bookingData
    });
    
    return bookingData;
};


export default sendBookingRequest;