import pool from 
'#config/database/postgres.js';

import { 
    ApiError
} from '#shared';


const createBookingsRequest = async ( 
    bookingData
) => {

    const query = `
        INSERT INTO booking_requests(
            search_session_id,
            user_id,
            technician_id,
            address_id,
            phone_id,
            phone_type,
            service_category_id,
            service_id,
            customer_note,
            booking_type
        )
        VALUES(
            $1,$2,$3,$4,$5,
            $6,$7,$8,$9,$10
        )
        RETURNING id AS bookingRequestId;
    `;

    const values = [
        bookingData.searchSessionId,
        bookingData.userId,
        bookingData.technicianId,
        bookingData.addressId,
        bookingData.phoneId,
        bookingData.phoneType,
        bookingData.serviceCategoryId,
        bookingData.serviceId,
        bookingData.customerNote,
        bookingData.bookingType
    ];

    try{
        const result =
            await pool.query(
                query,
                values
            );

        return result.rows[0].bookingRequestId;

    }catch(err){
        if(err.code === "23505"){
           switch(err.constraint){

                case "booking_requests_search_session_id_technician_id_key":
                    throw new ApiError(
                        409,
                        "Technician already requested"
                    );

                default:
                    throw err;
            }
        }

        throw err;
    }
};


export default createBookingsRequest;


/*
RETURNING (
        to_jsonb(booking_requests)
        -'created_at',
        -'responded_at'
        ) AS booking_request;
             
*/