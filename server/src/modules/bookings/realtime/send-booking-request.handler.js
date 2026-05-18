import sendRealtime from 
'#realtime/utils/send.realtime.js';

import { 
    asyncHandler
} from '#shared';

import {
    sendBookingRequest
} from '../services/send-booking-request.service.js';


const handleSendBookingRequest = 
asyncHandler(async (ws, data) => { 

    const bookingData = 
        await sendBookingRequest(
            data
        );

    const bookingRequestId =  
        bookingData.bookingRequestId;
    
    sendRealtime(ws,{
        event:
            "booking_request_sent",
        data:{
            bookingRequestId: bookingRequestId
        }
    });
});


export default handleSendBookingRequest;