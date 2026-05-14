import pool from 
'#config/database/postgres.js';

import { 
    asyncHandler,
    ApiError,
    ApiResponse,

    isValidPhone,
    isValidUUID
} from '#shared';


/*
    tu = technician_user,
    tpm = technician_performance_metric
    u = user
    a = address
*/

const technician_fields = [
    t.id,
    t.user_id,
    t.specialization,
    t.about,
    t.languages_spoken,
    t.experience_years,
    t.current_location_captured_at,
    tpm.average_rating,
    tpm.total_reviews,
    tpm.total_jobs_completed,
    tpm.job_acceptance_rate,
    tpm.job_completion_rate,
    t.last_seen_at,
    t.verified_at,
    t.highest_Qulification,
    tu.username,
    tu.email,
    tu.phone,
    tu.first_name,
    tu.last_name,
    tu.profile_picture_url,
];

const orderBy = 
    t.distance*0.30 +
    t.experience_years*0.20 +
    t.average_rating* 0.25+
    t.job_completion_rate*0.25;

const searchTechie = async(bookingData)=>{

    const query = `
        SELECT ${technician_fields},
            ST_AsGeoJSON(t.location) AS location,
            ST_Distance(
                t.location,
                a.location
            ) AS distance
        FROM technicians t
        JOIN ON addresses a
            a.id = $1
        WHERE a.user_id = $2 
            AND a.deleted_at IS NULL
            AND t.deleted_at IS NULL
            AND t.deactivated_at IS NULL
            AND t.verification_status = 'approved'
            AND t.status = 'online'
            AND t.availability_status = 'available'
            AND t.account_status = 'active'
            AND ST_DWithin(
                t.location,
                a.location,
                $3
            )
        JOIN ON users technician_user
            t.user_id = technician_user.id
        ORDER BY distance ASC;
    `;
};
