import pool from 
'#config/database/postgres.js';

import generateBookingCode from 
'../utils/booking-code.util.js';

import { 
    ApiError
} from '#shared';


const createBooking = async ({
    bookingRequest,
    client
}) => {

    const bookingCode = await generateBookingCode();

    const query = `
        INSERT INTO bookings(
            booking_code,
            search_session_id,
            booking_request_id,
            user_id,
            technician_id,
            address_id,
            service_category_id,
            service_id,
            customer_phone,
            phone_type,
            booking_type,
            customer_note,
            service_category_name,
            service_name,
            estimated_duration_minutes,
            base_fee
        )
        VALUES(
            $1, $2, $3, $4,
            $5, $6, $7, $8,
            $9, $10, $11, $12, 
            $13, $14, $15, $16
        )
        RETURNING (
            to_jsonb(bookings)
            -'created_at',
            -'updated_at',
            -'started_at',
            -'completed_at',
            -'cancelled_at',
            -'scheduled_at',
            -'actual_duration_minutes'
        ) AS booking;
    `;

    const values = [
        bookingCode,
        bookingRequest.search_session_id,
        bookingRequest.id,
        bookingRequest.user_id,
        bookingRequest.technician_id,
        bookingRequest.address_id,
        bookingRequest.service_category_id,
        bookingRequest.service_id,
        bookingRequest.customer_phone,
        bookingRequest.phone_type,
        bookingRequest.booking_type,
        bookingRequest.customer_note,
        bookingRequest.service_category_name,
        bookingRequest.service_name,
        bookingRequest.estimated_duration_minutes,
        bookingRequest.base_fee,
    ];

    try{
        const result =
            await client.query(
                query,
                values
            );
        
        return result.rows[0].booking;
        
    }catch(error){
        if(
            error.code === "23505"
        ){
            throw new ApiError(
                409,
                "Booking code conflict"
            );
        }

        throw error;
    }
};


export default createBooking;
