import bcrypt from "bcrypt";
import crypto from 'crypto';

import pool from 
'#config/database/postgres.js';

import {
    otpQueue,
    setCache,
    getCache,
    deleteCache,
    invalidateCaches
} from '#infra';

import {
    ApiError,
    ApiResponse,
    asyncHandler,
    hashPassword,
} from '#shared';

import {
    emailQueue
} from '#queues';


const forgotPassword = asyncHandler(async (req, res) => {
    const email = req.body.email?.trim().replace(/"/g, "") || "";
    const username = req.body.username?.trim() || "";
    const phone = req.body.phone?.trim()|| "";

    if(!email && !username && !phone){
        throw new ApiError(
            400,
            "Please provide email or username or phone number"
        );
    }

    const filter = email || username || phone; 

    const query = `
        SELECT 
            id,
            first_name,
            last_name,
            email,
            phone
        FROM users
            WHERE (email = $1
                    OR username = $1
                    OR phone = $1
                )
                AND deleted_at IS NULL
                AND deactivated_at IS NULL
        LIMIT 1; 
    `;
        
    const result = await pool.query(
        query,
        [filter]
    );

    if(result.rowCount === 0){
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "If account exists, OTP has been sent"
                )
            );
    }

    const user = result.rows[0];

    const forgotToken = crypto
        .randomBytes(32)
        .toString("hex");

    try{
        await otpQueue.add(
            "forgot-password",
            {
                userId: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                phone: user.phone,
                email: user.email,
                forgotToken
            },
            {
                jobId: `forgot-password:${forgotToken}`
            }
        );

    }catch(_){
        throw new ApiError(
            500,
            "Failed to send OTP, please try again"
        );
    }

    const userId = user.id;

    const forgotPasswordUserDataKey =
        `forgot-password:user:data:${forgotToken}`;

    await setCache(
        forgotPasswordUserDataKey,
        {
            userId
        },
        180
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    forgotToken
                },
                "If account exists, OTP has been sent"
            )
        );
});

const verifyForgotOTP = asyncHandler(async (req, res) => { 
    const forgotToken = req.body.forgotToken?.trim() || "";
    const otp = req.body.otp?.trim() || "";

    if(!forgotToken || !otp){
        throw new ApiError(
            400,
            "User ID and OTP are required"
        );
    }

    const forgotPasswordOtpKey = 
        `forgot-password:${forgotToken}`;

    const storedOTP = await getCache(
        forgotPasswordOtpKey
    );

    if(!storedOTP){
        throw new ApiError(
            400,
            "OTP expired or invalid"
        );
    }

    if(String(storedOTP) !== String(otp)) {
        throw new ApiError(
            400,
            "Invalid OTP"
        );
    }


    const forgotPasswordUserDataKey =
        `forgot-password:user:data:${forgotToken}`;

    const storedData = await getCache(
        forgotPasswordUserDataKey
    );

    if(!storedData){
        throw new ApiError(
            400,
            "Reset session expired"
        );
    }

    await deleteCache(forgotPasswordOtpKey);
    await deleteCache(forgotPasswordUserDataKey);

    const resetToken = crypto
        .randomBytes(32)
        .toString("hex");

    const resetPasswordKey =
        `reset-password:${resetToken}`;

    const userId = storedData.userId;

    await setCache(
        resetPasswordKey,
        {
            userId
        },
        180
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    resetToken
                },
                "OTP verified successfully"
            )
        );
});

const resetPassword = asyncHandler(async (req, res) => { 
    const resetToken = req.body.resetToken?.trim() || "";
    const newPassword = req.body.newPassword?.trim() || "";

    if(!resetToken || !newPassword){
        throw new ApiError(
            400,
            "All fields are required"
        );
    }
    
    const resetPasswordKey =
        `reset-password:${resetToken}`;

    const storedData = await getCache(
        resetPasswordKey
    );

    if(!storedData){
        throw new ApiError(
            401,
            "Reset session expired or invalid"
        );
    }

    const userId = storedData.userId;

    const hashedPassword = await hashPassword(newPassword);

    const query = `
        UPDATE users
        SET
            password = $1,
            refresh_token = NULL
        WHERE id = $2
            AND deleted_at IS NULL
            AND deactivated_at IS NULL;
    `;

    const result = await pool.query(
        query,
        [hashedPassword, userId]
    );

    if(result.rowCount === 0){
        throw new ApiError(
            400,
            "Password reset failed"
        );
    }

    await deleteCache(resetPasswordKey);
    await invalidateCaches(userId,null);

    try{
        await emailQueue.add(
            "password-reset",
            {
                userId
            },
            {
                jobId: `password-reset:${userId}`
            }
        );

    }catch(_) {}

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Password reset successfully"
            )
        );

});


export {
    forgotPassword,
    verifyForgotOTP,
    resetPassword
};