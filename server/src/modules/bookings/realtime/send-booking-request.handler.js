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

    const {
        bookingCode
    } = await sendBookingRequest(
        data
    );

    sendRealtime(ws,{
        event:
            "booking_request_sent",
        data:{
            bookingCode
        }
    });
});


export default handleSendBookingRequest;