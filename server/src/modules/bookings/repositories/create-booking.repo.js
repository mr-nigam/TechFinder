import pool from 
'#config/database/postgres.js';

import generateBookingCode from 
'../utils/booking-code.util.js';

import { 
    ApiError
} from '#shared';


const createBooking = async ({
    bookingData,
    client
}) => {

    const bookingCode = await generateBookingCode();

    const query = `
        INSERT INTO bookings(
            booking_code,
            user_id,
            technician_id,
            address_id,
            phone_id,
            service_category_id,
            booking_type,
            customer_note
        )
        VALUES(
            $1,$2,$3,$4,$5,$6,$7,$8
        )
        RETURNING 
            id, booking_code;
    `;

    const values = [
        bookingCode,
        bookingData.userId,
        bookingData.technicianId,
        bookingData.addressId,
        bookingData.phoneId,
        bookingData.serviceCategoryId,
        bookingData.bookingType,
        bookingData.notes
    ];

    try{
        const result =
            await client.query(
                query,
                values
            );

        return {
                bookingId: result.rows[0].id,
                bookingCode: result.rows[0].booking_code
            };

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
