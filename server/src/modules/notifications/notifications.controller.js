import {
    asyncHandler,
} from '#shared';


const getNotifications = asyncHandler(async (req,res) => { });
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