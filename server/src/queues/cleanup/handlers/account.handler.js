import pool from '#config/db.js';

import {
    emailQueue
} from '#queues';

import{
    invalidateCaches
} from '#lib/cache.js';


const deleteAccount = async (userId) => {

};


export default deleteAccount;