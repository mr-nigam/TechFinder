import pool from 
'#config/database/postgres.js';

import { 
    asyncHandler,
    ApiError,
    ApiResponse,

    isValidPhone,
    isValidUUID
} from '#shared';

import {
    otpQueue,
    emailQueue
} from '#queues';


const searchTechnicians = async(
    user,
    bookingData
) =>{

    const addressQuery = `
        SELECT 
            location
        FROM addresses
            WHERE id = $1 AND
                user_id = $2 AND
                deleted_at IS NULL
        LIMIT 1;
    `;

   const {
        rows: [address]
    } = await pool.query(
        addressQuery,
        [bookingData.addressId, user.id]
    );

    if(!address){
        throw new Error("Address not found");
    }

    const { location } = address;

    const query = `
        SELECT t.*,

    `;
};