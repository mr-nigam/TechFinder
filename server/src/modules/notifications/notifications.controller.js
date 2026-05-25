import {
    asyncHandler,
} from '#shared';



const getNotifications = asyncHandler(async (req,res) => {
    const user = req.user;

    let {
        page = 1,
        limit = 10,
        sortBy,
        sortType
    } = req.query;

    limit = Math.min(
        Math.max(parseInt(limit) || 10, 1),
        25
    );
    
    page = Math.max(
        parseInt(page) || 1, 1
    );

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