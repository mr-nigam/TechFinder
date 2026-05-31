import pool from 
'#config/database/postgres.js';

import {
    setCache,
    getCache,
    cachePaginatedList,
    getPaginatedList
} from '#infra';

import{
    ApiError,
    ApiResponse,
    getQueryOptions
} from '#shared';


const getNotifications = async(req)=>{
    
    let {
        page = 1,
        limit = 10,
        filter,
        sortBy,
        sortType
    } = getQueryOptions(req.query);


    const cachekKey = `notif:${filter}:${user.id}`
};


export {
    getNotifications
};