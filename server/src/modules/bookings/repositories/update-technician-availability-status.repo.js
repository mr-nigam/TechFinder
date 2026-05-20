import pool from
'#config/database/postgres.js';
import { ApiError } from '#shared';


const updateTechnicianAvailabilityStatus = async(
    technicianId,
    client
)=>{

    const query = `
        UPDATE technicians
            SET availability_status = 'busy'
        WHERE id = $1
            AND availability_status = 'available'
            AND deleted_at IS NULL
            AND deactivated_at IS NULL;
    `;

    const result = client.query(
        query,
        technicianId
    );

    if(result.rowCount === 0){
        throw new ApiError(
            400,
            "failed to book this technician, he is not available"
        );
    }
    
    return true;
};


export default updateTechnicianAvailabilityStatus;