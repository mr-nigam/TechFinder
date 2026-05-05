import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '#config/db';

import ApiError from '#shared/utils/apiError';
import ApiResponse from '#shared/utils/apiResponse';
import asyncHandler from '#shared/utils/asyncHandler'

import accountDeletionQueue from '../jobs/userAccount.queue.js';
import emailQueue from '../jobs/email.queue.js';

import{
    deleteMultipleCache
} from '#lib/cache';


const deactivateAccount = asyncHandler(async (req, res) => {
    const user = req.user;
    const password = req.body.password?.trim() || "";

    if(!password){
        throw new ApiError(
            400,
            "Please enter password"
        );
    }

    const cacheKeys = [
        `auth:user:${user.username}`,
        `auth:user:${user.email}`,
        `auth:user:${user.primary_phone_number}`
    ].filter(Boolean);


    let query = `
        SELECT 
            password
        FROM users
        WHERE id = $1
            AND deactivated_at IS NULL
            AND deleted_at IS NULL;
    `;

    let result = await pool.query(query, [user.id]);

    if(result.rows.length === 0){
        throw new ApiError(
            404,
            "Invalid credentials"
        );
    }

    let oldHashedpassword = result.rows[0].password;
    let isMatch = await bcrypt.compare(password, oldHashedpassword);

    if(!isMatch){
        throw new ApiError(
            401,
            "Invalid credentials"
        );
    }

    query = `
        UPDATE users
        set 
            deactivated_at = NOW(),
            updated_at = NOW(),
            refresh_token = NULL
        WHERE id = $1;
    `;
    
    result = await pool.query(query,[user.id]);

    try{
        await accountDeletionQueue.add(
            "deactivate-account",
            { userId: user.id },
            {   
                jobId: `deActivate:${user.id}`,
                delay: 90 * 24 * 60 * 60 * 1000 // 90 days in milliseconds
            }
        );    
        console.log("Account scheduled for deactivation/deletion in 90 days.");
    }catch(err){
        console.error("Queue error:", err.message);
    }
    
    try{
        await emailQueue.add(
            "request-deactivate-account",
            {
                userId: user.id,
                email: user.email,
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
            },
            {
                jobId: `user:-deactivated:${user.id}`
            }
        );
        console.log("Email will be sent for Account deactivation/deletion in 90 days.");
    }catch(err){
        console.error("Queue error:", err.message);
    }

    await deleteMultipleCache(cacheKeys);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "User deactivated successfully"
        )
    )
});

const reactivateAccount = asyncHandler(async (req, res) => {
    const client = await pool.connect();

    try{
        await client.query("BEGIN");
        const{
            email = "",
            username = "",
            primary_phone_number = "",
            password = ""
        } = req.body;

        const normalized = {
            email: email?.trim().toLowerCase().replace(/"/g, ""),
            username: username?.trim().toLowerCase(),
            primary_phone_number: primary_phone_number?.trim(),
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
        else if(normalized.primary_phone_number){
            column = "primary_phone_number";
            value = normalized.primary_phone_number;
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

        let job = await accountDeletionQueue.getJob(`delete:${user.id}`);
        
        if(job) await job.remove();

        job = await accountDeletionQueue.getJob(`deActivate:${user.id}`);
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

        console.error(err);
        throw new ApiError(
            404,
            err.message || "Account reactivation failed"
        );

    }finally{
        client.release();
    }
});

const deleteAccount = asyncHandler(async (req, res) => {
    const user = req.user;
    const password = req.body.password?.trim() || "";
    
    if(!password){
        throw new ApiError(
            400,
            "Please enter password"
        );
    }

    const cacheKeys = [
        `auth:user:${user.username}`,
        `auth:user:${user.email}`,
        `auth:user:${user.primary_phone_number}`
    ].filter(Boolean);

    let query = `
        SELECT 
        password
        FROM users
        WHERE id = $1
            AND deactivated_at IS NULL
            AND deleted_at IS NULL;
    `;

    let result = await pool.query(query, [user.id]);

    if(result.rows.length === 0){
        throw new ApiError(
            404,
            "Invalid credentials"
        );
    }

    let oldHashedpassword = result.rows[0].password;


    let isMatch = await bcrypt.compare(password, oldHashedpassword);

    if(!isMatch){
        throw new ApiError(
            401,
            "Invalid credentials"
        );
    }

    query = `
        UPDATE users
        set
            deleted_at = NOW(),
            refresh_token = NULL
        WHERE id = $1;
    `;
    
    await pool.query(query,[user.id]);

    try{
        await accountDeletionQueue.add(
            "delete-account",
            { userId: user.id },
            { 
                jobId: `delete:${user.id}`,
                delay: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
            }
        );

        console.log("Account scheduled for deletion in 30 days.");
    }catch(err){
        console.error("Queue error:", err.message);
    }

    try{
        await emailQueue.add(
            "request-delete-account",
            {
                userId: user.id,
                email: user.email,
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
            },
            {
                jobId: `user:-deleted:${user.id}`
            }
        );
        console.log("Email will be sent for Account deactivation/deletion in 30 days.");
    }catch(err){
        console.error("Queue error:", err.message);
    }

    await deleteMultipleCache(cacheKeys);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "User deleteed successfully"
            )
        );
});


export {
    deactivateAccount,
    reactivateAccount,
    deleteAccount
}

