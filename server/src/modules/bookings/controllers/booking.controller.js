import pool from 
'#config/database/postgres.js';
        
import validateBookingData from 
'../validator/booking.validate.js';

import searchNearbyTechnicians from 
'../services/booking.service.js';

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
    
});

const getAvailableSlots = asyncHandler(async (req, res) => { });

const validateBookingAvailability = asyncHandler(async (req, res) => { });


export {
    searchTechnicians
};
