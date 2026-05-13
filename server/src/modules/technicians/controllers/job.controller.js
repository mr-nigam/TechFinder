import pool from 
'#config/database/postgres.js';

import {
    ApiError,
    ApiResponse,
    asyncHandler
} from '#shared';

import {
    emailQueue
} from '#queues';


const getAssigned = asyncHandler(async (req, res) =>{ });
const getHistory = asyncHandler(async (req, res) =>{ });
const sendJobRequest = asyncHandler(async (req, res) =>{ });
const accept = asyncHandler(async (req, res) =>{ });
const reject = asyncHandler(async (req, res) =>{ });
const arrived = asyncHandler(async (req, res) =>{ });
const start = asyncHandler(async (req, res) =>{ });
const complete = asyncHandler(async (req, res) =>{ });
const cancel = asyncHandler(async (req, res) =>{ });


export {
    getAssigned,
    getHistory,
    sendJobRequest,
    accept,
    reject,
    arrived,
    start,
    complete,
    cancel
};