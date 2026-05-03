import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '#config/db';
import asyncHandler from '#utils/asyncHandler';
import ApiError from '#utils/apiError';
import ApiResponse from '#utils/apiResponse';

import {
    deleteAccountQueue,
    deActivateAccountQueue
} from '../jobs/userAccount.queue.js';


const deactivateAccount = asyncHandler(async (req, res) => {
    const password = req.body.password?.trim() || "";
    const userId = req.user.id;

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
        WHERE id = $1
            AND deactivated_at IS NULL
            AND deleted_at IS NULL;
    `;

    let result = await pool.query(query, [userId]);

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
            status = 'pending_delete'
        WHERE id = $1;
    `;
    
    result = await pool.query(query,[userId]);

    try{
        await deActivateAccountQueue.add(
            "deactivate-account",
            { userId: user.id },
            { jobId: `deActivate-${user.id}`}
        );
        
        console.log("Account scheduled for deactivation/deletion in 90 days.");

    }catch(err){

        console.error("Queue error:", err.message);
    }

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
            primary_contact_number = "",
            password = ""
        } = req.body;

        const normalized = {
            email: email?.trim().toLowerCase().replace(/"/g, ""),
            username: username?.trim().toLowerCase(),
            primary_contact_number: primary_contact_number?.trim(),
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
        else if(normalized.primary_contact_number){
            column = "primary_contact_number";
            value = normalized.primary_contact_number;
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

        let result = await pool.query(query,[value]);

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

        await pool.query(query,[user.id]);

        let job = await deleteAccountQueue.getJob(`delete-${user.id}`);
        if(job){
            await job.remove();
        }

        job = await deActivateAccountQueue.getJob(`deActivate-${user.id}`);
        if(job){
            await job.remove();
        }   
        
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
    const password = req.body.password?.trim() || "";
    const userId = req.user.id;

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
        WHERE id = $1
            AND deactivated_at IS NULL
            AND deleted_at IS NULL;
    `;

    let result = await pool.query(query, [userId]);

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
            deleted_at = true,
            user.status = 'pending_delete'
        WHERE id = $1;
    `;
    
    result = await pool.query(query,[userId]);

    try{
        
        user.status = "pending_delete";
        await user.save();

        await deleteAccountQueue.add(
            "delete-account",
            { userId: user.id },
            { jobId: `delete-${user.id}`}
        );
        
        console.log("Account scheduled for deletion in 30 days.");

    }catch(err){

        console.error("Queue error:", err.message);
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "User deletied successfully"
        )
    )

});


export {
    deactivateAccount,
    reactivateAccount,
    deleteAccount
}

