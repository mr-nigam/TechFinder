import pool from '#config/db.js';

import {
    ApiError,
    ApiResponse,
    asyncHandler,
    isValidUUID,
} from '#shared';


const getNotifications = asyncHandler(async (req,res) => { 
    const user = req.user;
    const technician = req.technician;

    let {} = req.query;
});

const getNotificationsInRange = asyncHandler(async (req,res) => { });
const getUnreadCount = asyncHandler(async (req,res) => { });
const markRead = asyncHandler(async (req,res) => { });
const markAllRead = asyncHandler(async (req,res) => { });


export {
    getNotifications,
    getNotificationsInRange,
    getUnreadCount,
    markRead,
    markAllRead
};