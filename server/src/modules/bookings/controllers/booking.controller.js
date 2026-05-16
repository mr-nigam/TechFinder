import pool from 
'#config/database/postgres.js';
        
import validateBookingData from 
'../validator/booking.validate.js';

import searchNearbyTechnicians from 
'../services/search-technicians.service.js';

import { 
    asyncHandler,
    ApiError,
    ApiResponse,

    isValidPhone,
    isValidUUID
} from '#shared';

import {
    otpQueue,
    emailQueue
} from '#queues';

// DISCOVERY PHASE

const searchTechnicians = asyncHandler(async (req,res) => { 
    const user = req.user;

    const bookingData = 
        validateBookingData(req?.body);
    
    const nearbyTechs = 
        await searchNearbyTechnicians(
            user.id,
            bookingData
        );
    
    // No technicians found
    if(!nearbyTechs.length){
        return res.status(200).json({
            success: true,
            message: "No nearby technicians found",
            technicians: []
        });
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    profiles: nearbyTechs
                },
                "Nearby technicians data fecthed successfully"
            )
        )
});

const getAvailableSlots = asyncHandler(async (req, res) => { });

const validateBookingAvailability = asyncHandler(async (req, res) => { });


export {
    searchTechnicians
};
