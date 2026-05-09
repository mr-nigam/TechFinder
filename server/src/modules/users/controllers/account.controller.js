import bcrypt from 'bcrypt';
import pool from '#config/db.js';

import {
    ApiError,
    ApiResponse,
    asyncHandler
} from '#shared';

import {
    emailQueue,
    cleanupQueue
} from '#queues';

import{
    invalidateCaches
} from '#lib/cache.js';


const deleteAccount = asyncHandler(async (req, res) => {
    const user = req.user;
    const technician = req.technician || null;

    const password = req.body.password?.trim() || "";

    if(!password){
        throw new ApiError(
            400,
            "Please enter password"
        );
    }

    let query = `
        SELECT 
            password
        FROM users
        WHERE id = $1;
    `;

    let result = await pool.query(query, [user.id]);

    if(result.rows.length === 0){
        throw new ApiError(
            404,
            "User not found"
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

    const client = await pool.connect();

    try{
        
        await client.query("BEGIN");

        let query = `
            UPDATE users
            SET deleted_at = NOW(),
                refresh_token = NULL
            WHERE id = $1;
        `;

        let result = await client.query(query,[user.id]);
        
        if(result.rowCount === 0){
            throw new ApiError(
                400,
                "Failed to delete user account"
            );
        }

        if(technician){
            let query = `
                UPDATE technicians
                SET deleted_at = NOW()
                WHERE id = $1;
            `;

            let result = await client.query(query,[technician.id]);
        
            if(result.rowCount === 0){
                throw new ApiError(
                    400,
                    "Failed to delete technician account"
                );
            }
        }

        await client.query("COMMIT");

    }catch(err){
        
        try{
            await client.query("ROLLBACK");
        }catch(_) {}

        throw new ApiError(
            err.statusCode || 500,
            err.message || "Failed to delete user account"
        );
        
    }finally{

        client.release();
    }
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

    try{
        await cleanupQueue.add(
            "user:delete:account",
            { 
                userId: user.id 
            },
            {   
                jobId: `user:delete:${user.id}`,
                delay: THIRTY_DAYS
            }
        );    
        console.log("Account scheduled for deactivation/deletion in 90 days.");
    }catch(err){
        console.error("Queue error:", err.message);
    }
    
    try{
        await emailQueue.add(
            "request:delete:account",
            { 
                userId: user.id
            },
            {
                jobId: `user:delete:${user.id}`
            }
        );
        console.log("Email will be sent for Account deactivation/deletion in 90 days.");
    }catch(err){
        console.error("Queue error:", err.message);
    }

    res.clearCookie(
        "accessToken",
        {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        }
    );
    
    res.clearCookie(
        "refreshToken",
        {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        }
    );

    await invalidateCaches(
        user.id,
        technician?.id || null
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "User deleted successfully"
            )
        );
});

const deactivateAccount = asyncHandler(async (req, res) => {
    const user = req.user;
    const technician = req.technician || null;

    const password = req.body.password?.trim() || "";

    if(!password){
        throw new ApiError(
            400,
            "Please enter password"
        );
    }

    let query = `
        SELECT 
            password
        FROM users
        WHERE id = $1;
    `;

    let result = await pool.query(query, [user.id]);

    if(result.rows.length === 0){
        throw new ApiError(
            404,
            "User not found"
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

    const client = await pool.connect();

    try{
        
        await client.query("BEGIN");

        let query = `
            UPDATE users
            SET deactivated_at = NOW(),
                refresh_token = NULL
            WHERE id = $1;
        `;

        let result = await client.query(query,[user.id]);
        
        if(result.rowCount === 0){
            throw new ApiError(
                400,
                "Failed to deactivate user account"
            );
        }

        if(technician){
            let query = `
                UPDATE technicians
                SET deactivated_at = NOW()
                WHERE id = $1;
            `;

            let result = await client.query(query,[technician.id]);
        
            if(result.rowCount === 0){
                throw new ApiError(
                    400,
                    "Failed to deactivate technician account"
                );
            }
        }

        await client.query("COMMIT");

    }catch(err){
        
        try{
            await client.query("ROLLBACK");
        }catch(_) {}

        throw new ApiError(
            err.statusCode || 500,
            err.message || "Failed to deactivate user account"
        );
        
    }finally{

        client.release();
    }
    const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000;

    try{
        await cleanupQueue.add(
            "user:deactivate:account",
            { 
                userId: user.id 
            },
            {   
                jobId: `user:deactivate:${user.id}`,
                delay: NINETY_DAYS
            }
        );    
        console.log("Account scheduled for deactivation/deletion in 90 days.");
    }catch(err){
        console.error("Queue error:", err.message);
    }
    
    try{
        await emailQueue.add(
            "request:deactivate:account",
            { 
                userId: user.id
            },
            {
                jobId: `user:deactivated:${user.id}`
            }
        );
        console.log("Email will be sent for Account deactivation/deletion in 90 days.");
    }catch(err){
        console.error("Queue error:", err.message);
    }

    res.clearCookie(
        "accessToken",
        {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        }
    );
    
    res.clearCookie(
        "refreshToken",
        {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        }
    );

    await invalidateCaches(
        user.id,
        technician?.id || null
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "User deactivated successfully"
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

