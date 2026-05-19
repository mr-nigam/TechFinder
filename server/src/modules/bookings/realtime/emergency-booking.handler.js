import validateBookingData from 
'../validator/booking.validate.js';

import { 
    asyncHandler 
} from "#shared";

import {
    emergencyBooking
} from '../services/index.js';

import sendRealtime from 
'#realtime/utils/send.realtime.js';


const handleEmergencyBooking = 
asyncHandler( async( ws, data) => {
    const user = ws.user;

    const bookingDetails = 
        validateBookingData(data);
    
    bookingDetails.userId = user.id;
    bookingDetails.customerPhone = user.phone;

    const booking = 
        await emergencyBooking(
            bookingDetails
        );

    if(!booking){
        sendRealtime(ws, {
            event: "emergency_booking_failed",
            data :{
                booking: {}
            }
        })
    }

    sendRealtime(ws, {
        event: "emergency_booking_success",
        data :{
            booking
        }
    })

    
});


export default handleEmergencyBooking;