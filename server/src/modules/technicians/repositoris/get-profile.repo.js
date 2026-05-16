import pool from 
'#config/database/postgres.js';

import {
    ApiError,
} from '#shared';


/*
    tu = technician_user,
    tpm = technician_performance_metric
    u = user
    ts = technician_skills,
*/

const technician_fields = [
   "t.id",
    "t.specialization",
    "t.about",
    "t.languages_spoken",
    "t.experience_years",
    "t.last_seen_at",
    "t.highest_qualification",
    "t.service_radius_km",
    "t.verified_at",
    "t.current_location",
    "t.hourly_rate",
    "t.service_category_id",

    "tu.username",
    "tu.email",
    "tu.phone",
    "tu.first_name",
    "tu.last_name",
    "tu.profile_picture_url",


    "tpm.average_rating",
    "tpm.total_reviews",
    "tpm.total_completed",
    "tpm.acceptance_rate",
    "tpm.completion_rate",
    "tpm.ranking_score",

    `
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'service_id', ts.service_id,
                'service_name', ts.service_name
            )
        ) FILTER (WHERE ts.service_id IS NOT NULL),
        '[]'
    ) AS skills
    `
];

const getProfileData = async(technicianId)=>{
    const query = `
        SELECT ${technician_fields.join(",")}
        FROM technicians t

        JOIN users tu
            ON t.user_id = tu.id
        
        JOIN echnician_performance_metric tpm
            ON t.id = tpm.technician_id
        
        JOIN technician_skills ts
            ON t.id = ts.technician_id
            AND ts.deleted_at IS NULL

        WHERE t.id = $1
            AND t.deleted_at IS NULL
            AND t.deactivated_at IS NULL

        GROUP BY
            t.id,
            tu.id,
            tpm.id;
    `;

    const result = await pool.query(
        query,
        [technicianId]
    );
    
    if(result.rowCount === 0){
        throw new ApiError(
            400,
            "Technician not found"
        );
    }

    return result.rows[0];
};


export default getProfileData;