import pool from 
'#config/database/postgres.js';

import {
    cachePaginatedList,
    getPaginatedList
} from '#infra';

import{
    ApiError,
    ApiResponse,
    asyncHandler,
    getQueryOptions
} from '#shared';


const getNotifications = asyncHandler(async (req, res) => {
    const user = req.user;

    const {
        page = 1,
        limit = 10,
        filter,
        sortBy,
        sortType
    } = getQueryOptions(req.query);

    const queryKey = [
        filter ?? "all",
        sortBy ?? "createdAt",
        sortType ?? "desc"
    ].join(":");

    const cachekKey = 
        `notif:u:${user.id}:q:${queryKey}`;

    let notif = [];

    try{
        notif = 
            await getPaginatedList(
                cachekKey,
                page,
                limit
            ) ?? [];
    }catch {}

    const offset = 500;
    if(notif.length === 0){
        const query = `
            SELECT
                id,
                title,
                body,
                category,
                is_read,
                recipient_id
            FROM notifications
            WHERE recipient_id = $1
                AND deleted_at IS NULL
            ORDER BY
                ${orderField}
                ${sortType}
            LIMIT $2
        `;

        const result = await pool.query(
            query,
            [user.id, offset]
        );

        notif = result.rows;
    }

    try{
        await cachePaginatedList(
            cachekKey,
            notif,
            180
        );

        notif = 
            await getPaginatedList(
                cachekKey,
                page,
                limit
            ) ?? [];
    }catch {}

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    notifications: notif
                },
                "All notifications fetched successfully"
            )
        );
});

const getNotificationsInRange = asyncHandler(async (req,res) => {});
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