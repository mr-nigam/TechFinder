import bcrypt from 'bcrypt';
import pool from '#config/db';

import ApiError from '#shared/utils/apiError';
import ApiResponse from '#shared/utils/apiResponse';
import asyncHandler from '#shared/utils/asyncHandler'

import hashPassword from '#shared/utils/password.util';

import {
    generateAccessToken,
    generateRefreshToken,
} from '#shared/utils/tokens.util';

import {
    getAccessCookieOptions,
    getRefreshCookieOptions,
} from '#shared/utils/cookie.util';


import {
    deleteCache,
    deleteMultipleCache
} from '#lib/cache';


const changePassword = asyncHandler(async (req, res) => {
    const user = req.user;

    const{oldPassword, newPassword} = req.body;

    if(!oldPassword || !newPassword){
        throw new ApiError(
            400, 
            "Old and new password are required"
        );
    }
    
    if(oldPassword === newPassword){
        throw new ApiError(
            400,
            "New password must be different"
        );
    }

    let query = `
        SELECT password
        FROM users
        WHERE id = $1
        LIMIT 1;
    `;

    let result = await pool.query( query, [user.id]);

    if(result.rowCount === 0){
        throw new ApiError(
            404,
            "user not found"
        );
    }

    let oldHashedpassword = result.rows[0].password;

    const isMatch = await bcrypt.compare(oldPassword,oldHashedpassword);
    if(!isMatch){
        throw new ApiError(
            401,
            "Invalid credentials"
        );
    }

    const newHashedPassword = await hashPassword(newPassword);
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    query = `
        UPDATE users
        set password = $1,
            refresh_token = $2,
            password_changed_at = NOW()
        WHERE id = $3
        RETURNING
            id,
            username,
            first_name,
            last_name,
            role;
    `;

    const values = [
        newHashedPassword,
        refreshToken,
        user.id,
    ];
    
    result = await pool.query(query, values);

    if(result.rowCount === 0){
        throw new ApiError(
            404,
            "invalid credentials"
        );
    }

    const cacheKey = `profile:user:${user.id}`;
    await deleteCache(cacheKey);

    return res
        .status(200)
        .cookie("accessToken",accessToken,getAccessCookieOptions())
        .cookie("refreshToken",refreshToken,getRefreshCookieOptions())
        .json(
            new ApiResponse(
                200,
                {user: result.rows[0]},
                "Password changed successfully"
            )
        );
    
});

const changeEmail = asyncHandler(async (req, res) => {});
const sendEmailOtp = asyncHandler(async (req, res) => {});
const verifyEmail = asyncHandler(async (req, res) => {});


const changePrimaryPhone = asyncHandler(async (req, res) => {});
const sendPrimaryPhoneOtp = asyncHandler(async (req, res) => {});
const verifyPrimaryPhone = asyncHandler(async (req, res) => {});



export {
    changePassword,
    changeEmail,
    verifyEmail,
    sendEmailOtp,
    changePrimaryPhone,
    verifyPrimaryPhone,
    sendPrimaryPhoneOtp
};
