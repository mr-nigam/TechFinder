import pool from 
'#config/database/postgres.js';


const getActiveTechnicians = async(
    lng,
    lat,
    serviceCategoryId
) => {
    const query = `
        SELECT 
            t.id AS technicianId,
            tpm.ranking_score AS rankingScore,

            ST_Distance(
                t.current_location::geography,
                ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
            ) AS distance

        FROM technicians t
        
        JOIN technician_performance_metrics tpm
            ON t.id = tpm.technician_id
        
        WHERE t.service_category_id = $3
            AND t.deleted_at IS NULL
            AND t.deactivated_at IS NULL
            AND t.verification_status = 'approved'
            AND t.status = 'online'
            AND t.availability_status = 'available'
            AND t.account_status = 'active'
            AND ST_DWithin(
                t.current_location::geography,
                ST_SetSRID( 
                    ST_MakePoint($1, $2),
                    4326
                )::geography,
                10000
            )
        
        ORDER BY distance ASC
        LIMIT 500;
    `;

    const values = [
        lng,
        lat,
        serviceCategoryId
    ];

    const result = await pool.query(
        query,
        values
    );

    return result.rows;
};


export default getActiveTechnicians;