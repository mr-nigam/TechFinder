import pool from 
'#config/database/postgres.js';


const reviews_fields = `
    "r.id",
    "r.service_name",
    "r.booking_type",
    "r.service_type_name",
    "r.rating",
    "r.title",
    "r.body",
    "r.is_edited",
    "r.created_at",
    "jsonb_build_object(
        ''
    )"
`;

const getTechnicianReviews = async({
    limit,
    sortBy,
    sortType,
    username,
    offset = 500
})=>{

    const query = `
        SELECT 
            reviewer.username AS reviewer_username,
            reviewer.profile_picture_url, 
            r.technician_id,
            r.service_type_name,
            r.booking_type,
            r.rating,
            r.title,
            r.body,
            r.is_edited,
            r.created_at
        FROM reviews r
        JOIN technicians t
            ON t.id = r.technician_id
        JOIN users technician_user
            ON t.user_id = technician_user.id
        JOIN users reviewer
            ON r.user_id = reviewer.id
        WHERE technician_user.username = $1
        ORDER BY ${sortBy} ${sortType}
        LIMIT $2 OFFSET $3;
    `;

    const values = [
        username,
        limit,
        offset
    ];
    
    const result = await pool.query(
        query,
        values
    );

    return result.rows;
};

const getReviewById = async(
    reviewId
)=>{
    const query = `
        SELECT
            reviewer.username AS reviewer_username,
            reviewer.first_name AS reviewer_first_name,
            reviewer.last_name AS reviewer_last_name,
            reviewer.profile_picture_url,
            r.id,
            r.service_name,
            r.booking_type,
            r.service_type_name,
            r.rating,
            r.title,
            r.body,
            r.is_edited,
            r.created_at,
            jsonb_build_object(
                ra.
            )
    `;
};


export {
    getTechnicianReviews,
    getReviewById
};