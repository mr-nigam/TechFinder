import pool from
'#config/database/postgres.js';

import crypto from 'crypto';

import {
    updateBookingRequestStatus,
    createBookingsRequest
} from '../repositories/index.js';

import {
    ApiError
} from '#shared';

import {
    setLock,
    releaseLock,
    getBookingCache
} from '../bookingRedis/cache.js';

import {
    notifyUser,
    notifyTechnician
} from '#notifications/services/index.js';

const rejectBooking = async( 
    data,
    technician
) => {

};


export default rejectBooking;