import pool from '#config/db';

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