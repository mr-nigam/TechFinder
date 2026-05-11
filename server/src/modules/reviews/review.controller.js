import pool from '#config/db.js';

import {
    ApiError,
    ApiResponse,
    asyncHandler,

    isValidUUID
} from '#shared';


const reviews_fields = `
    id,
    service_type_name,
    service_name,
    booking_type,
    rating,
    title,
    body,
    is_edited,
    created_at
`;

const createReview = asyncHandler(async (req,res) => {
    const user = req.user;
    const bookingId = req.params?.bookingId?.trim() || null;

    if(
        !bookingId || 
        !isValidUUID(bookingId)
    ){
        throw new ApiError(
            400,
            "Please give a valid booking id"
        );
    }

    const query = `
        SELECT 
            id,
            user_id,
            technician_id,
            service_type_id,
            service_type_name,
            service_name,
            booking_type
        FROM bookings
        WHERE id = $1
            AND user_id = $2
            AND status = 'completed';
    `;

    let result = await pool.query(
        query,
        [bookingId, user.id]
    );

    if(result.rowCount === 0){
        throw new ApiError(
            404,
            "Booking not found or you are not authorized to review it"
        );
    }
    
    const bookingData = result.rows[0];

    try{
        let {rating = 0, title, body} = req.body;
        
        rating = Number(rating.toFixed(1));

        if(
            isNaN(rating) ||
            rating <= 0 ||
            rating > 5
        ){
            throw new ApiError(
                400,
                "Rating must be in between 0 and 5"
            );
        }
        
        title = title?.trim() || "";
        body = body?.trim() || "";

        if(!title && !body){
            throw new ApiError(
                400,
                "Write something in review"
            );
        }

        const query = `
            INSERT INTO reviews(
                user_id,
                technician_id,
                booking_id,
                service_type_id,
                service_type_name,
                service_name,
                booking_type,
                rating,
                title,
                body
            )
            VALUES( $1, $2, $3, $4, $5,
                $6, $7, $8, $9, $10
            )
            RETURNING ${reviews_fields};
        `;

        const values = [
            bookingData.user_id,
            bookingData.technician_id,
            bookingData.id,
            bookingData.service_type_id,
            bookingData.service_type_name,
            bookingData.service_name,
            bookingData.booking_type,
            rating,
            title,
            body
        ];

        const result = await pool.query(
            query,
            values
        );

        if(result.rowCount === 0){
            throw new ApiError(
                400,
                "Failed to create review"
            );
        }

        let review = result.rows[0];

        review.username = user.username;

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    {
                        review
                    },
                    "Review created successfully"
                )
            );
    
    }catch(err){
        if(err.code === "23505"){
            throw new ApiError(
                409,
                "You have already reviewed this booking"
            );
        }

        throw new ApiError(
            err.statusCode || 500,
            err.message || "Failed to create review"
        );
    }
});

const updateReview = asyncHandler(async (req,res) => { 
    const user = req.user;
    const reviewId = req.params?.reviewId?.trim() || null;

    if(
        !reviewId || 
        !isValidUUID(reviewId)
    ){
        throw new ApiError(
            400,
            "Please give a valid review id"
        );
    }

    let { rating, title, body } = req.body;

    rating = Number(rating.toFixed(1));

    if(
        isNaN(rating) ||
        rating <= 0 ||
        rating > 5
    ){
        throw new ApiError(
            400,
            "Rating must be in between 0 and 5"
        );
    }

    title = title?.trim() || "";
    body = body?.trim() || "";

    if(!title && !body){
        throw new ApiError(
            400,
            "Write something in review"
        );
    }

    const query = `
        UPDATE reviews
        SET rating = $1,
            title = $1,
            body = $3,
            is_edited = true
        WHERE id = $4
            AND user_id = %5
            AND deleted_at IS NULL
        RETURNING ${reviews_fields};
    `;
});

const deleteReview = asyncHandler(async (req,res) => { 
    const user = req.user;
    const reviewId = req.params?.reviewId?.trim() || null;

    if(
        !reviewId ||
        !isValidUUID(reviewId)
    ){
        throw new ApiError(
            400,
            "Please give a valid review id"
        );
    }

    const query = `
        DELETE FROM reviews
        WHERE id = $1
            AND user_id = $2;
    `;

    const result = await pool.query(
        query,
        [reviewId, user.id]
    );

    if(result.rowCount === 0){
        throw new ApiError(
            404,
            "Review not found"
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Review deleted successfully"
            )
        );
});

const getReviewById = asyncHandler(async (req,res) => { 
    const reviewId = req.params?.reviewId?.trim() || null;

    if(
        !reviewId || 
        !isValidUUID(reviewId)
    ){
        throw new ApiError(
            400,
            "Please provide valid review id"
        );
    }

    const query = `
        SELECT ${reviews_fields}
        FROM reviews
        WHERE id = $1
            AND deleted_at IS NULL
        LIMIT 1;
    `;

    const result = await pool.query(
        query,
        [reviewId]
    );

    if(result.rowCount === 0){
        throw new ApiError(
            404,
            "Comment not found"
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    review: result.rows[0]
                },
                "Review fetched successfully"
            )
        );
});

const getReviews = asyncHandler(async (req,res) => { 
    let {
        page = 1,
        limit,
        sortBy,
        sortType,
        username,
    } = req.query;

    limit = Math.min(Math.max(parseInt(limit) || 10, 10), 10);
    page = Math.max(parseInt(page) || 1, 1);

    username = username?.trim() || null;
    sortBy = sortBy?.trim() || "";

    sortType = sortType?.trim()?.toUpperCase();

    sortType = sortType === "ASC"? "ASC": "DESC";

    const skip = (page-1)*limit;

    if(!username){
        throw new ApiError(
            400,
            "username is missing"
        );
    }

    const allowedSortBy = [
        "created_at",
        "rating",
        "service_type_name"
    ];

    if(!allowedSortBy.includes(sortBy)){
        sortBy = "created_at";
    }

    let query = `
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
        skip
    ];

    let result = await pool.query(
        query,
        values
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    reviews: result.rows
                },
                "Reviews fetched successfully"
            )
        );
});


export {
    createReview,
    updateReview,
    deleteReview,
    getReviewById,
    getReviews
}