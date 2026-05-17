import {
    setBookingCache,
    getBookingCache,
    deleteBookingCache
} from '../bookingRedis/cache.js';

import createBooking from 
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

    const { 
        bookingId,
        bookingCode
    } = await createBooking({
        bookingData
    });

    await deleteBookingCache(
        draftKey
    );

    bookingData.bookingCode = data.bookingCode;
    bookingData.bookingId = data.bookingId;

    await setBookingCache(
        draftKey,
        bookingData
    );

    await notifyTechnician({
        bookingData
    });
    
    return bookingCode;
};


export default sendBookingRequest;