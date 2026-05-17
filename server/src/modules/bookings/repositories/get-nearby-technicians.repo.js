import pool from 
'#config/database/postgres.js';


const getTechnicians = async(
    lng,
    lat,
    serviceCategoryId
) => {
    const query = `
        SELECT 
            t.id,
            t.specialization,
            t.experience_years,
            t.service_category_id,
            t.hourly_rate,

            ST_Distance(
                t.current_location::geography,
                ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
            ) AS distance,
            
            tu.profile_picture_url,
            tu.first_name,
            tu.last_name,

            tpm.ranking_score,
            tpm.total_reviews,
            tpm.average_rating

        FROM technicians t

        JOIN users tu
            ON t.user_id = tu.id
        
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


export default getTechnicians;