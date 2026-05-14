import pool from 
'#config/database/postgres.js';

import { 
    ApiError,
} from '#shared';

import {
    setCache,
    geoAdd
} from '#infra/cache/cache.js';

/*
    tu = technician_user,
    tpm = technician_performance_metric
    u = user
    a = address
    ts = technician_skills,


    approved
    active
    online
    available
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


const startWorking = async(technicianId)=>{

    const query = `
        SELECT ${technician_fields}
        FROM technicians t

        JOIN ON users tu
            t.user_id = tu.id
        
        JOIN ON technician_performance_metric tpm
            t.id = tpm.technician_id
        
        JOIN ON technician_skills ts
            t.id = ts.technician_id
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

    const profile = result.rows[0];
    
    if(!profile.verified_at){
        throw new ApiError(
            403,
            "Technician is not verified"
        );
    }

    if(
        profile.verification_status !== "approved" || 
        profile.account_status !== "active"
    ){
        throw new ApiError(
            403,
            "Technician account is not verified or banned/suspended"
        );
    }

    if(!profile.current_location){
        throw new ApiError(
            400,
            "Current location not found"
        );
    }   
    
    const updateQuery = `
        UPDATE technicians
        SET
            status = 'online',
            availability_status = 'available',
            last_seen_at = NOW()
        WHERE id = $1
    `;

    await pool.query(
        updateQuery,
        [technicianId]
    );

    const technicianCard = {
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        specialization: profile.specialization,
        experience_years: profile.experience_years,
        average_rating: profile.average_rating,
        ranking_score: profile.ranking_score,
        hourly_rate: profile.hourly_rate,
        profile_picture_url: profile.profile_picture_url,
        service_category_id:profile.service_category_id
    };

    const cardCacheKey =
        `technician:card:${technicianId}`;

    const profileCacheKey =
        `technician:profile:${technicianId}`;

    const geoKey =
        "geo:technicians:online";

    
    const cardCacheTTL = 15 * 60; // 15 mins
    const profileCacheTTL = 60 * 60; // 1 hour

    /*
        extract coordinates
        current_location is geography(Point,4326)

        ST_X = longitude
        ST_Y = latitude
    */

    const coordinateQuery = `
        SELECT
            ST_X(current_location::geometry) AS longitude,
            ST_Y(current_location::geometry) AS latitude
        FROM technicians
        WHERE id = $1
    `;

    const coordinateResult = await pool.query(
        coordinateQuery,
        [technicianId]
    );

    const coordinates =
        coordinateResult.rows[0];

    
    await Promise.allSettled([

        setCache(
            cardCacheKey,
            technicianCard,
            cardCacheTTL
        ),

        setCache(
            profileCacheKey,
            profile,
            profileCacheTTL
        ),

        geoAdd(
            geoKey,
            Number(coordinates.longitude),
            Number(coordinates.latitude),
            technicianId
        )
    ]);

    return true;
};


export default startWorking;