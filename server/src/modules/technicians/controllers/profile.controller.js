import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '#config/db';
import redisConnection from '#config/redis';

import ApiError from '#shared/utils/apiError';
import ApiResponse from '#shared/utils/apiResponse';
import asyncHandler from '#shared/utils/asyncHandler';

import {
    checkUserDetails,
    formatTechnicianProfile
} from '#shared/utils/technician.util';

import { 
    emailQueue,
    technicianQueue
} from '../jobs/technician.queue.js';

import { 
    getCache,
    setCache,
    deleteCache,
    deleteMultipleCache
} from '#lib/cache';


const register = asyncHandler(async (req, res) => {
    const user = req.user;
    
    await checkUserDetails(user);

    const {
        specialization = "",
        about = "",
        languages_spoken = [],
        service_radius_km = 15,
    } = req.body;
        
    const normalized = {
        specialization:specialization?.trim() || "",
        about : about?.trim() || ""
    };

    if(!normalized.specialization ||
        !normalized.about ||
        !Array.isArray(languages_spoken) ||
        languages_spoken.length === 0
    ){
        throw new ApiError(
            400,
            "All required fields must be provided"
        );
    }

    const client = await pool.connect();
    
    try{
        await client.query("BEGIN");
        
        let query = `
            INSERT INTO technicians(
                user_id,
                specialization,
                about,
                languages_spoken,
                service_radius_km
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;

        let values = [
            user.id,
            normalized.specialization,
            normalized.about,
            languages_spoken,
            service_radius_km
        ];

        let result = await client.query(query,values);

        if(result.rowCount === 0){
            throw new ApiError(
                500,
                "Technician registration failed"
            );
        }

        query = `
            UPDATE users 
            SET role = 'technician'
            WHERE id = $1;
        `;

        await client.query(query,[user.id]);
        
        let technician = {
            ...result.rows[0],
            phone: user.phone,
        };
        
        technician = formatTechnicianProfile(technician);

        await client.query("COMMIT");

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    technician,
                    "Technician registered successfully"
                )
            );
    }catch(err){
        await client.query("ROLLBACK");
        
        if(err.code === "23505"){
            throw new ApiError(
                409,
                "Technician profile already exists"
            );
        }

        throw new ApiError(
            err.statusCode || 500,
            err.message || "Technician registration failed"
        );

    }finally{
        await client.release();
    }
});

const updateProfile = asyncHandler(async (req, res) =>{ });

const deleteAccount = asyncHandler(async (req, res) =>{
    const user = req.user;
    const technician = req.technician;
    
    if(!technician){
        throw new ApiError(
            404,
            "Technician profile not found"
        );
    }

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
    
    let result = await pool.query(query,[user.id]);

    if(result.rows.length === 0){
        throw new ApiError(
            401,
            "Invalid credentials"
        );
    }

    let oldHashedpassword = result.rows[0].password;
    const isMatch = await bcrypt.compare(password,oldHashedpassword);

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
            UPDATE technicians
                SET deleted_at = NOW(),
                status = 'offline'
            WHERE id = $1; 
        `;
        
        await client.query(query,[technician.id]);

        query = `
            UPDATE users
                set role = 'user',
                refresh_token = NULL
            WHERE id = $1;
        `;

        await client.query(query,[user.id]);

        await client.query("COMMIT");

    }catch(err){
        try {
            await client.query("ROLLBACK");
        } catch (_) {}

        throw new ApiError(
            err.statusCode || 500,
            err.message || "Technician profile deletion failed"
        );

    }finally{
        client.release();
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

    const cacheKeys = [
        `auth:user:${user.user.id}`,
        `auth:user:${technician.id}`,
        `auth:user:${user.username}`,
        `auth:user:${user.email}`,
        `auth:user:${user.phone}`
    ].filter(Boolean);

    await deleteMultipleCache(cacheKeys);

    try{
        await technicianQueue.add(
            "delete-account",
            { 
                userId: user.id,
                technicianId: technician.id
            },
            { 
                jobId: `delete:${technician.id}`,
                delay: 30 * 24 * 60 * 60 * 1000 // 30 days
            }
        );

        console.log("Technician account scheduled for deletion in 30 days.");
    }catch(err){
        console.error("Queue error:", err.message);
    }

    try{
        await emailQueue.add(
            "request-delete-account",
            {
                userId: user.id,
                technicianId: technician.id
            },
            {
                jobId: `technician:-deleted:email:${technician.id}`
            }
        );

        console.log("Email will be sent for technician account deactivation/deletion in 30 days.");
    }catch(err){
        console.error("Queue error:", err.message);
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Technician account deleted successfully. It will be permanently deleted after 30 days."
            )
        );

});

const getReviews = asyncHandler(async (req, res) =>{ });
const getProfile = asyncHandler(async (req, res) =>{ });
const updateCurrentLocation = asyncHandler(async (req, res) =>{ });


export {
    register,
    updateProfile,
    deleteAccount,
};