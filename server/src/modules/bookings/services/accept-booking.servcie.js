import pool from
'#config/database/postgres.js';

import crypto from 'crypto';

import {
    ApiError
} from '#shared';

import {
    setLock,
    releaseLock
} from '../bookingRedis/cache.js';

import {
    notifyUser
} from '#notifications/services/index.js';

import {
    createBooking,
    updateBookingRequestStatus,
    updateTechnicianAvailabilityStatus
} from '../repositories/index.js';

import {
    acceptedEmergencyBookings
} from './index.js';

import sendRealtime from 
'#realtime/utils/send.realtime.js';
 
// setup a new chat session between both
// send normal notifications also
const acceptBooking = async( 
    ws,
    data,
    technician
) => {
    const query = `
        SELECT search_session_id
        FROM booking_requests
        WHERE id = $1;
    `;
    
    const result  = await pool.query(
        query,
        [data.bookingRequestId]
    );

    const searchSessionId = 
        result.rows[0]
        .search_session_id;
        
    // const draftKey = 
    //     `booking_draft:${searchSessionId}`;

    const lockKey =
        `booking_lock:${searchSessionId}`;
    
    const lockValue = crypto.randomUUID();

    const acquired = 
        await setLock(
            lockKey,
            lockValue
        );

    if(!acquired){
        throw new ApiError(
            409,
            "Booking already processing"
        );
    }

    const client = await pool.connect();

    let booking;
    try{

        await client.query("BEGIN");

        await updateTechnicianAvailabilityStatus(
            technician.id,
            client
        );

        const bookingRequest =  
            await updateBookingRequestStatus(
                client,
                "accepted",
                technician.id,
                data.bookingRequestId
            );

        bookingRequest.technician_id = technician.id;

        booking = await createBooking(
            bookingRequest,
            client
        );

        await client.query("COMMIT");

    }catch(err){

        try{
            await client.query("ROLLBACK");
        }catch {}
        
        await releaseLock(
            lockKey,
            lockValue
        );

        if(err.code === "23505"){
            if(
                err.constraint?.includes("search_session_id") ||
                err.constraint?.includes("booking_request_id")    
            ){
                throw new ApiError(
                    409,
                    "Booking has already done"
                );
            }
        }

        throw new ApiError(
            err.statusCode || 500,
            err.message || "Booking has already done"
        );
    }finally{

        await releaseLock(
            lockKey,
            lockValue
        );
        
        client.release();
    }
    
    if(booking.booking_type === "emergency"){
        acceptedEmergencyBookings.set(
            data.bookingRequestId,
            {
                bookingId: booking.id,
                bookingCode: booking.bookingCode
            }
        );
        
        setTimeout(() => {
            acceptedEmergencyBookings.delete(
                data.bookingRequestId
            );

        }, 90000);
    }
    
    await notifyUser({
        event:"technician_booked_successfully",
        data: {
            userId: booking.user_id,
            bookingId: booking.id,
            bookingCode: booking.bookingCode
        }
    });
    
    //to techi
    sendRealtime(
        ws,
        {
            event:"booking_confirmed",
            data:{
                bookingId: booking.id,
                bookingCode: booking.bookingCode
            }
        }
    )
};


export default acceptBooking;