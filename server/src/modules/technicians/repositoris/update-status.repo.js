import pool from 
'#config/database/postgres.js';

import {
    ApiError,
} from '#shared';


const updateStatus = async(technicianId) => {

    const query = `
        UPDATE technicians
        SET
            status = 'online',
            availability_status = 'available',
            last_seen_at = NOW()
        WHERE id = $1;
    `;

    const result = await pool.query(
        query,
        [technicianId]
    );

    if(result.rowCount === 0){
        throw new ApiError(
            400,
            "Account not found"
        );
    }

    return true;
};


export default updateStatus;