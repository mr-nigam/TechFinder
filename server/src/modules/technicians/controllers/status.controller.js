import pool from 
'#config/database/postgres.js';

import {
    ApiError,
    ApiResponse,
    asyncHandler
} from '#shared';


const goOnline = asyncHandler(async (req, res) => { });
const goOffline = asyncHandler(async (req, res) => { });
const updateStatus = asyncHandler(async (req, res) => { });


export {
    goOnline,
    goOffline,
    updateStatus
};