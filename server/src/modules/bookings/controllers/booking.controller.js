import { 
    asyncHandler,
    ApiError,
    ApiResponse,

    isValidUUID
} from '#shared';

import {
    cachePaginatedList,
    getPaginatedList
} from '#infra';

import {
    getBookings,
    getBookingDetails
} from '../repositories/index.js';

import { 
    customerFields,
    technicianFields
} from '#shared';

const allowedSortBy = [
    'booking_type',
    'status',
    'total_amount',
    'completed_at',
    'created_at'
];


const getCustomerBookingHistory = asyncHandler(async (req, res) => {
    const user = req.user;

    let {
        page = 1,
        limit,
        sortBy,
        sortType,
        filterStatus,
        filterBookingType,
    } = req.query;


    limit = Math.min(
        Math.max(parseInt(limit) || 10, 1),
        20
    );
    
    page = Math.max(
        parseInt(page) || 1, 1
    );

     if(!allowedSortBy.includes(sortBy)){
        sortBy = "created_at"
    };

    sortType = sortType === "DESC"? "DESC": "ASC";

    const cacheKey = [
        "user:history",
        user.id,
        filterStatus || "all",
        filterBookingType || "all",
        sortBy,
        sortType
    ].join(":");

    let bookings = [];
    
    try{
        bookings = await getPaginatedList(
            cacheKey,
            page,
            limit
        )
    }catch(err){
        console.error(
            "Failed to fetch booking history from cache:",
            err
        );
    };

    if(bookings?.length > 0){
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        bookings
                    },
                    "Bookings fetched successfully"
                )
            );
    }

    bookings = await getBookings({
        ownerId: user.id,
        role: "customer",
        bookingType: filterBookingType,
        status: filterStatus,
        sortBy,
        sortType,
    });

    await cachePaginatedList(
        cacheKey,
        bookings
    );

    const start = (page - 1) * limit;
    const end = start + limit;

    const paginatedBookings = bookings.slice(
        start,
        end
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    bookings: paginatedBookings,
                    pagination: {
                        page,
                        limit,
                        total: bookings.length,
                        totalPages: Math.ceil(
                            bookings.length / limit
                        )
                    }
                },
                "Bookings fetched successfully"
            )
        );    
});

const getCustomerBookingDetails = asyncHandler(async(req, res)=>{
    const user = req.user;
    const bookingId = req.params?.bookingId?.trim() || null;

    if(!isValidUUID(bookingId)){
        throw new ApiError(
            403,
            "Invalid booking id"
        );
    }

    const booking = await getBookings({
        role: "customer",
        ownerId: user.id,
        bookingId,
        bookingFields: customerFields
    });

    if(!booking){
        throw new ApiError(
            400,
            "No Booking found with this id"
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    booking   
                },
                "Fetched data successfully"
            )
        )
});

const getTechnicianBookingHistory = asyncHandler(async (req, res) => {
    const technician = req.technician;

    let {
        page = 1,
        limit,
        sortBy,
        sortType,
        filterStatus,
        filterBookingType,
    } = req.query;


    limit = Math.min(
        Math.max(parseInt(limit) || 10, 1),
        20
    );
    
    page = Math.max(
        parseInt(page) || 1, 1
    );

     if(!allowedSortBy.includes(sortBy)){
        sortBy = "created_at"
    };

    sortType = sortType === "DESC"? "DESC": "ASC";

    const cacheKey = [
        "technician:history",
        technician.id,
        filterStatus || "all",
        filterBookingType || "all",
        sortBy,
        sortType
    ].join(":");

    let bookings = [];
    
    try{
        bookings = await getPaginatedList(
            cacheKey,
            page,
            limit
        )
    }catch(err){
        console.error(
            "Failed to fetch booking history from cache:",
            err
        );
    };

    if(bookings?.length > 0){
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        bookings
                    },
                    "Bookings fetched successfully"
                )
            );
    }

    bookings = await getBookings({
        ownerId: technician.id,
        role: "technician",
        bookingType: filterBookingType,
        status: filterStatus,
        sortBy,
        sortType,
    });

    await cachePaginatedList(
        cacheKey,
        bookings
    );

    const start = (page - 1) * limit;
    const end = start + limit;

    const paginatedBookings = bookings.slice(
        start,
        end
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    bookings: paginatedBookings,
                    pagination: {
                        page,
                        limit,
                        total: bookings.length,
                        totalPages: Math.ceil(
                            bookings.length / limit
                        )
                    }
                },
                "Bookings fetched successfully"
            )
        );    
});

const getTechnicianBookingDetails = asyncHandler(async(req, res)=>{
    const technician = req.technician;
    const bookingId = req.params?.bookingId?.trim() || null;

    if(!isValidUUID(bookingId)){
        throw new ApiError(
            403,
            "Invalid booking id"
        );
    }

    const booking = await getBookings({
        role: "technician",
        ownerId: technician.id,
        bookingId,
        bookingFields: technicianFields
    });

    if(!booking){
        throw new ApiError(
            400,
            "No Booking found with this id"
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    booking   
                },
                "Fetched data successfully"
            )
        )
});


export {
    getCustomerBookingHistory,
    getCustomerBookingDetails,
    getTechnicianBookingHistory,
    getTechnicianBookingDetails
};
