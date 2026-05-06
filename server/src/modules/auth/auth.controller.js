import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import pool from '#config/db';
import redisConnection from '#config/redis';

import ApiError from '#shared/utils/apiError';
import ApiResponse from '#shared/utils/apiResponse';
import asyncHandler from '#shared/utils/asyncHandler';
import hashPassword from '#shared/util/password';
import removeLocalFile from '#shared/utils/file';
import isValidPhone from '#shared/utils/phone.util';

import {
    formatOwnUser,
} from '#shared/utils/user.utils';

import {
    generateAccessToken,
    generateRefreshToken
} from '#shared/utils/tokens.util';

import {
    hasEmpty,
    isValidUUID
} from '#shared/utils/validation.utils';

import { 
    uploadOnCloudinary,
    deleteFromCloudinary,
} from '#shared/services/storage.service';

import client from '#lib/twilioClient';

import { 
    getCache,
    setCache,
    deleteCache,
    deleteMultipleCache
} from '#lib/cache';

import { 
    otpQueue,
    emailQueue 
} from './auth.queue.js';

const registerUser = asyncHandler(async (req, res) => {
    let profilePictureLocalPath = "";

    try{
        const {
            email = "",
            username = "",
            first_name = "",
            last_name = "",
            bio = "",
            gender = "",
            password = "",
            phone = "",
            date_of_birth = null
        } = req.body;
        
        const normalized = {
            email: email.trim().toLowerCase().replace(/"/g, ""),
            username: username.trim().toLowerCase(),
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            bio: bio?.trim() || "User",
            gender: gender?.trim() || "not shared",
            password: password.trim(),
            phone: phone.trim(),
        };

        const requiredFields = [
            normalized.email,
            normalized.username,
            normalized.first_name,
            normalized.last_name,
            normalized.password,
            normalized.phone,
        ];

        if(hasEmpty(requiredFields)){
            throw new ApiError(
                400,
                "All required fields are not given"
            );
        }

        isValidPhone({ phone });

        // check email format
        profilePictureLocalPath = req?.file?.path || "";
        const profilePicture = profilePictureLocalPath
            ? await uploadOnCloudinary(profilePictureLocalPath)
            : null;

        let hashedPassword = "";
        try{
            hashedPassword = await hashPassword(normalized.password,10);   
        }catch(err){
            throw new ApiError(
                400, err.message
            );
        }

        const query = `
            INSERT INTO users (
                username, email, first_name, last_name, 
                phone, gender, bio, date_of_birth, 
                profile_picture_public_id, 
                profile_picture_url, 
                password
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *;
        `;

        const values = [
            normalized.username,
            normalized.email,
            normalized.first_name, 
            normalized.last_name,
            normalized.phone,
            normalized.gender,
            normalized.bio,
            date_of_birth,
            profilePicture?.public_id || null,
            profilePicture?.secure_url || null,
            hashedPassword,
        ];

        const result = await pool.query(query, values);

        const user = result.rows[0];

        if(!user){
            throw new ApiError(
                400,
                "User registration failed"
            );
        }

        try{
            await emailQueue.add("sendWelcomeEmail", 
                { userId: user.id},
                {
                    jobId: `register:${user.id}`,
                }
            );
        }catch(err){
            console.error("Queue error:", err.message);
        }

        return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                {user: formatOwnUser(user)},
                "User registered successfully"
            )
        );

    }catch(err){
        try{
            await removeLocalFile(profilePictureLocalPath);
        } catch{}
        
        if(err.code === "23505"){
            if (err.constraint?.includes("email")) {
                throw new ApiError(
                    409,
                    "Email already registered"
                );
            }

            if (err.constraint?.includes("username")) {
                throw new ApiError(
                    409,
                    "Username already taken"
                );
            }

            if (err.constraint?.includes("phone")) {
                throw new ApiError(
                    409,
                    "Contact number already in use"
                );
            }

            throw new ApiError(
                409,
                "Duplicate record exists"
            );
        }
        
        throw new ApiError(
            201,
            "User registration failed"
        );
    }
});

const logInUser = asyncHandler (async (req, res) => {
    const email = req.body.email?.trim().replace(/"/g, "") || "";
    const username = req.body.username?.trim() || "";
    const phone = req.body.phone?.trim()|| "";
    const password = req.body.password?.trim() || "";

    if(!email && !username && !phone){
        throw new ApiError(
            404,
            "Please provide email, username, contact number"
        );
    }

    if(!password){
        throw new ApiError(
            404,"Please enter password"
        );
    }

    
    const filter = email || username || phone; 

     
    let cacheKey = `auth:user:${filter}`;
    let user;

    // Try Redis
    user = await getCache(cacheKey);
    
    if(!user){
        const query = `
            SELECT id, username, email, password 
            FROM users
            WHERE (email = $1
                    OR username = $1
                    OR phone = $1
                )
                AND deleted_at IS NULL
                AND deactivated_at IS NULL
            LIMIT 1; 
        `;
        
        const result = await pool.query(query,[filter]);

        user = result.rows[0];

        if(!user){
            throw new ApiError(
                400,
                "Invalid credentials"
            );
        }
    }

    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
        throw new ApiError(
            401,
            "Invalid credentials"
        );
    }
        
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
        
    let query = `
        UPDATE users
        SET refresh_token = $1
        WHERE id = $2
        RETURNING *;
    `;
    
    const result = await pool.query(query,[refreshToken,user.id]);
    user = result.rows[0];

    await setCache(cacheKey, user, 600);

    return res
        .status(200)
        .cookie("accessToken",accessToken,getAccessCookieOptions())
        .cookie("refreshToken",refreshToken,getRefreshCookieOptions())
        .json(
            new ApiResponse(
                200,
                {user: formatOwnUser(user)},
                "User logged in successfully"
            )
        );

});

const logOutUser = asyncHandler (async (req, res) => {
    const user = req.user;

    const query = `
        UPDATE users
        SET refresh_token = NULL
        WHERE id = $1;
    `;

    const result = await pool.query(query,[user.id]);

    const cacheKeys = [
        `auth:user:${user.username}`,
        `auth:user:${user.email}`,
        `auth:user:${user.phone}`
    ].filter(Boolean);

    await deleteMultipleCache(cacheKeys); 

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "User logged Out"
            )
        );
});

const refreshAccessToken = asyncHandler (async (req, res) => {
    const incomingRefreshToken = 
        req?.cookies?.refreshToken || req?.body?.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(
            401,
            "Unauthorized request"
        );
    }

    try{
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        
        let query = `
            SELECT *
            FROM users
            WHERE id = $1
                AND refresh_token = $2
                AND deleted_at IS NULL
                AND deactivated_at IS NULL
            LIMIT 1;
        `;

        const values = [
            decodedToken.id,
            incomingRefreshToken
        ];

        const result = await pool.query(query,values);

        const user = result.rows[0];

        if(!user){
            throw new ApiError(
                401,
                "Refresh token is expired or used"
            );
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        query = `
            UPDATE users
            SET refresh_token = $1
            WHERE id = $2;
        `;

        await pool.query(query,[refreshToken, user.id]);
        
        return res
            .status(200)
            .cookie("accessToken",accessToken,getAccessCookieOptions())
            .cookie("refreshToken",refreshToken,getRefreshCookieOptions())
            .json(
                new ApiResponse(
                    200,
                    {user: formatOwnUser(user)},
                    "Access token refreshed successfully"
                )
            );

    }catch(err){
        throw new ApiError(
            401,
            err?.message || "invalid refresh token"
        );
    }
});

const forgotPassword = asyncHandler(async (req, res) => {});
const resetPassword = asyncHandler(async (req, res) => {});


export {
    registerUser,
    logInUser,
    logOutUser,
    refreshAccessToken,
    forgotPassword,
    resetPassword
};


