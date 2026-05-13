import bcrypt from 'bcrypt';

import pool from 
'#config/database/postgres.js';

import {
    ApiError,
    ApiResponse,
    asyncHandler,
    
    clearAuthCookies,
} from '#shared';

import {
    emailQueue,
    cleanupQueue
} from '#queues';

import{
    invalidateCaches
} from '#infra';

import {
    verifyUserPassword,
    processAccountStatusChange
} from '#services';


const deleteAccount = asyncHandler(async (req, res) => {
    const user = req.user;
    const technician = req.technician || null;

    const client = await pool.connect();

    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

    const message =
        await processAccountStatusChange({

            user,
            technician,
            password: req.body.password,
            client,

            statusField: "deleted_at",
            actionName: "delete",

            cleanupQueue,
            cleanupJobName: "user:delete",
            cleanupDelay: THIRTY_DAYS,

            emailQueue,
            emailJobName:
                "request:user:delete",
            emailQueueJobId:
                "user:delete",

            invalidateCaches,

            successMessage:
                "User deleted successfully"
        });

    clearAuthCookies(res);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                message
            )
        );
});

const deactivateAccount = asyncHandler(async (req, res) => {
    const user = req.user;
    const technician = req.technician || null;

    const client = await pool.connect();

    const NINETY_DAYS  = 90 * 24 * 60 * 60 * 1000;

    const message =
        await processAccountStatusChange({

            user,
            technician,
            password: req.body.password,
            client,

            statusField: "deactivated_at",
            actionName: "deactivate",

            cleanupQueue,
            cleanupJobName: "user:deactivate",
            cleanupDelay: NINETY_DAYS,

            emailQueue,
            emailJobName:
                "request:deactivate:account",
            emailQueueJobId:
                "user:deactivated",

            invalidateCaches,
            
            successMessage:
                "User deactivated successfully"
        });

    clearAuthCookies(res);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                message
            )
        );
});

const reactivateAccount = asyncHandler(async (req, res) => {
    const client = await pool.connect();

    try{
        await client.query("BEGIN");
        const{
            email = "",
            username = "",
            phone = "",
            password = ""
        } = req.body;

        const normalized = {
            email: email?.trim().toLowerCase().replace(/"/g, ""),
            username: username?.trim().toLowerCase(),
            phone: phone?.trim(),
            password: password?.trim()
        };
        

        if(!normalized.password){
            throw new ApiError(
                400, 
                "Please enter password"
            );
        }

        let value = "";
        let column = "";
        
        if(normalized.email){
            column = "email";
            value = normalized.email;
        }
        else if(normalized.username){
            column = "username";
            value = normalized.username;
        }
        else if(normalized.phone){
            column = "phone";
            value = normalized.phone;
        }
        else{
            throw new ApiError(
                400,
                "Email, username or phone number is required"
            );
        }
        
        let query = `
            SELECT 
                id,
                password,
                status,
                deleted_at,
                deactivated_at
            FROM users
            WHERE ${column} = $1
            LIMIT 1;
        `;

        let result = await client.query(query,[value]);

        let user = result.rows[0];

        if (!user) {
            throw new ApiError(
                404,
                "Invalid credentials"
            );
        }

        const isMatch = await bcrypt.compare(
            normalized.password,
            user.password
        );

        if(!isMatch) {
            throw new ApiError(401, "Invalid credentials");
        }

        if(!user.deleted_at && !user.deactivated_at){
            throw new ApiError(
                400,
                "Account is not scheduled for deletion"
            );
        }
        
        query = `
            UPDATE users
            SET deleted_at = NULL,
                deactivated_at = NULL,
                status = 'active'
            WHERE id = $1;
        `;

        await client.query(query,[user.id]);

        let job = await cleanupQueue.getJob(`user:delete:${user.id}`);
        if(job) await job.remove();

        job = await cleanupQueue.getJob(`user:deactivate:${user.id}`);
        if(job) await job.remove();
        
        await client.query("COMMIT");

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "Account reactivated successfully login to use"
                )
            );

    }catch(err){
        await client.query("ROLLBACK");

        throw new ApiError(
            404,
            err.message || "Account reactivation failed"
        );

    }finally{
        client.release();
    }
});


export {
    deleteAccount,
    deactivateAccount,
    reactivateAccount
};

