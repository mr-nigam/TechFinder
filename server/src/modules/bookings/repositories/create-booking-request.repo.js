import pool from 
'#config/database/postgres.js';

import { 
    ApiError
} from '#shared';


const createBookingsRequest = async ( 
    bookingDetails
) => {

    let customerPhone = 
        bookingDetails.customerPhone;

    let phoneType = "primary";
    
    if(
        bookingDetails.phoneType !== "primary"
    ){
        const query = `
            SELECT 
                phone, 
                phone_type
            WHERE id = $1
                AND user_id = $2
                AND deleted_at IS NULL;
        `;

        const result = await pool.query(
            query,
            [
                bookingDetails.phoneId, 
                bookingDetails.userId
            ]
        );
        
        if(result.rows[0].phone){
            customerPhone = result.rows[0].phone;
            phoneType = result.rows[0].phone_type;
        }
    }

    const serviceQuery = `
        SELECT 
            service_name,
            service_category_name,
            estimated_duration_minutes,
            base_fee,
            technician_payout
        FROM services
        WHERE id = $1
            AND service_category_id = $2
            AND deleted_at IS NULL
            AND is_active = true;
    `;

    const result = await pool.query(
        serviceQuery,
        [
            bookingDetails.serviceId,
            bookingDetails.searchSessionId
        ]
    );

    if(result.rowCount === 0){
        throw new ApiError(
            400,
            "Service is not available or inactive at this time"
        );
    }

    const serviceData = result.rows[0];

    const query = `
        INSERT INTO booking_requests(
            search_session_id,
            user_id,
            technician_id,
            address_id,
            service_category_id,
            service_id,
            customer_note,
            booking_type,
            customer_phone,
            phone_type,

            service_category_name,
            service_name,
            estimated_duration_minutes,
            base_fee,
            technician_payout
        )
        VALUES(
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15
        )
        RETURNING (
            to_jsonb(booking_requests)
            -'created_at',
            -'responded_at'
        ) AS booking_request;
    `;

    const values = [
        bookingDetails.searchSessionId,
        bookingDetails.userId,
        bookingDetails.technicianId || null,
        bookingDetails.addressId,
        bookingDetails.serviceCategoryId,
        bookingDetails.serviceId,
        bookingDetails.customerNote,
        bookingDetails.bookingType,
        customerPhone,
        phoneType,
        serviceData.service_category_name,
        serviceData.service_name,
        serviceData.estimated_duration_minutes,
        serviceData.base_fee,
        serviceData.technician_payout
    ];

    try{
        const result =
            await pool.query(
                query,
                values
            );

        return result.rows[0];

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