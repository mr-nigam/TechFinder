import pool from
'#config/database/postgres.js';

import crypto from 'crypto';

import {
    updateBookingRequestStatus,
    createBooking
} from '../repositories/index.js';

import {
    ApiError
} from '#shared';

import {
    setLock,
    releaseLock,
    getBookingCache
} from '../bookingRedis/cache.js';

// send confirmation message to user and coordinates of techie, all details of booking
// send onformation message to techie and update his assiged to show this booking and send him all details 
// setup a new chat session between both
// delete booking_request from db using direct method or by queue if expired

const acceptBooking = async( 
    technician, 
    data 
) => {
    const query = `
        SELECT search_session_id
        FROM booking_requests
        WHERE id = $1
            AND user_id = $2
            AND deleted_at IS NULL;
    `;
    
    const result  = await pool.query(
        query,
        [data.bookingRequestId]
    );

    const searchSessionId = 
        result.rows[0].searchSessionId;
        
    const draftKey = 
        `booking_draft:${searchSessionId}`;

    const lockKey =  
        `booking_lock:${searchSessionId}`;
    
    const lockValue =  crypto.randomUUID();

    const acquired = await setLock(
        lockKey,
        lockValue
    );

    if(!acquired){
        throw new Error(
            "Booking already processing"
        );
    }

    const client = await pool.connect();

    try{
        await client.query("BEGIN");

        const bookingRequest =  
            await updateBookingRequestStatus(
                data.bookingRequestId,
                "accepted",
                client
            );

        const booking = await createBooking(
            bookingRequest,
            client
        );
        
        await client.query("COMMIT");
    }catch(err){

        try{
            await client.query("ROLLBACK");
        }catch {}
        
        if(err.codes === "23505"){
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
        client.release();
    }

    const result = await updateBookingStatus(
        data.bookingId,
        "accepted"
    );


}

export default acceptBooking;