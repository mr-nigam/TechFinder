import pool from
'#config/database/postgres.js';

import {
    updateBookingRequestStatus
} from '../repositories/index.js';

import {
    ApiError
} from '#shared';

import {
    notifyUser
} from '#notifications/services/index.js';


const rejectBooking = async( 
    data,
    technician
) => {

    const client = await pool.connect();

    let bookingRequest;
    try{
        client.query("BEGIN");

        bookingRequest =  
            await updateBookingRequestStatus(
                client,
                "rejected",
                technician.id,
                data.bookingRequestId
            );
        client.query("COMMIT");
    }catch(err){
        try{
            client.query("ROLLBACK");
        }catch {}
        
        throw new ApiError(
            500,
            "Booking rejection failed"
        );
    }finally{
        client.release();
    }

    if(
        bookingRequest.booking_type 
        !== "emergency"
    ){
        return;
    }

    await notifyUser({
        event:"technician_rejected_booking",
        data: {
            userId: bookingRequest.user_id,
            searchSessionId: bookingRequest.search_session_id,
            technicianId: bookingRequest.technician_id,
            message: "Search for another technician or schedule for later."
        }
    });

    return true;
};


export default rejectBooking;