import pool from '#config/db.js';

import {
    ApiError,
    ApiResponse,
    asyncHandler,

    isValidUUID
} from '#shared';

import {
    cleanupQueue,
    cloudinaryQueue
} from '#queues';


const getReviewerType = (
    booking,
    userId,
    technicianId
) => {
    
    if(
        userId &&
        userId === booking.user_id
    ){
        return "user";
    }

    if(
        technicianId &&
        technicianId === booking.technician_id
    ){
        return "technician";
    }

    return null;
};

const createReview = asyncHandler(async (req,res) => {
    const user = req.user || null;
    const technician = req.technician || null;
    
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
            booking_type
        FROM bookings
        WHERE id = $1
            AND status = 'completed';
    `;

    let result = await pool.query(query,[bookingId]);

    if(result.rowCount === 0){
        throw new ApiError(
            404,
            "Booking not found"
        );
    }
    
    const bookingData = result.rows[0];

    const reviewerType = getReviewerType(
        user?.id,
        technician?.id,
        bookingData
    );

    if(!reviewerType){
        throw new ApiError(
            403,
            "You are not allowed to review this booking"
        );
    }
    
    try{
        let {rating = 0, title, body} = req.body;
        
        if(rating<=0 || rating>5){
            throw new ApiError(
                400,
                "Rating must be in between 0 and 5"
            );
        }
        
        title = title?.trim() || "";
        body = body?.trim() || "";

        const query = `
            INSERT INTO reviews(
                user_id,
                technician_id,
                booking_id,
                rating,
                title,
                body,
                reviewer_type,
                service_type_id,
                booking_type
            )
            VALUES( $1, $2, $3, $4,
                $5, $6, $7, $8, $9
            )
            RETURNING 
                id,
                rating, 
                title,
                body,
                reviewer_type,
                service_type_id,
                booking_type;
        `;

        const values = [
            bookingData.user_id,
            bookingData.technician_id,
            bookingData.id,
            rating,
            title,
            body,
            reviewerType,
            bookingData.service_type_id,
            bookingData.booking_type
        ];

        const result = await pool.query(query,values);

        if(result.rowCount === 0){
            throw new ApiError(
                400,
                "Failed to create review"
            );
        }

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    {
                        review: result.rows[0]
                    },
                    "Reviews created successfully"
                )
            );
    
    }catch(err){
        if(err.code === "23505"){
            throw new ApiError(
                409,
                "You had already reviewed for this booking"
            );
        }

        throw new ApiError(
            err.statusCode || 500,
            err.message || "Failed to create review"
        );
    }
});

const updateReview = asyncHandler(async (req,res) => { });
const deleteReview = asyncHandler(async (req,res) => { });

const getReviewById = asyncHandler(async (req,res) => { }); 
const getUserReviews = asyncHandler(async (req,res) => { });
const getTechnicianReviews = asyncHandler(async (req,res) => { });


export {
    createReview,
    updateReview,
    deleteReview,
    getReviewById,
    getUserReviews,
    getTechnicianReviews
}