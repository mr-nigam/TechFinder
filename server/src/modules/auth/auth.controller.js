import jwt from 'jsonwebtoken';
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
    
    generateAccessToken,
    generateRefreshToken,
    getAccessTokenCookieOptions,
    getRefreshTokenCookieOptions,
    setAuthCookies,
    clearAuthCookies,
    
    hasEmpty,
    isValidPhone,
    isValidEmail,
    
    removeLocalFile
} from '#shared';

import {
    cleanupQueue,
    emailQueue
} from '#queues';

import {
    uploadOnCloudinary
} from '#services';


const register = asyncHandler(async (req, res) => {
    let localPath = "";
    let public_id = "";

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

        isValidPhone(normalized.phone);
        isValidEmail(normalized.email);

        localPath = req?.file?.path || "";
        const profilePicture = localPath
            ? await uploadOnCloudinary(localPath)
            : null;
        
        public_id = profilePicture?.public_id || "";

        let hashedPassword = "";
        try{

            hashedPassword = await hashPassword(normalized.password,10);   
        
        }catch(err){
            throw new ApiError(
                400,
                err.message
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
            RETURNING 
                id, 
                username,
                email,
                first_name,
                last_name,
                phone,
                role;
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

        if(result.rowCount === 0){
            throw new ApiError(
                400,
                "User registration failed"
            );
        }

        try{
            await emailQueue.add(
                "welcome", 
                { 
                    userId: user.id
                },
                {
                    jobId: `welcome:${user.id}`,
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
                    {user: result.rows[0]},
                    "User registered successfully"
                )
            );

    }catch(err){
        try{
            await removeLocalFile(localPath);
        }catch(_) {}

        try{
            await cleanupQueue.add(
                "cloudinary:file:delete", 
                { 
                    public_id: public_id,
                    resourceType: "image"
                },
                {
                    jobId: `cloudinary:file:delete:${public_id}`
                }
            );

        }catch(_) {}

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
            err.statusCode || 500,
            err.message || "User registeration falied"
        );
    }
});

const logIn = asyncHandler (async (req, res) => {
    const email = req.body.email?.trim().replace(/"/g, "") || "";
    const username = req.body.username?.trim() || "";
    const phone = req.body.phone?.trim()|| "";
    const password = req.body.password?.trim() || "";

    if(!email && !username && !phone){
        throw new ApiError(
            400,
            "Please provide email, username, phone number"
        );
    }

    if(!password){
        throw new ApiError(
            400,
            "Please enter password"
        );
    }

    
    const filter = email || username || phone; 

    let query = `
        SELECT 
            id,
            username,
            email, 
            password 
        FROM users
            WHERE (email = $1
                    OR username = $1
                    OR phone = $1
                )
                AND deleted_at IS NULL
                AND deactivated_at IS NULL
        LIMIT 1; 
    `;
        
    let result = await pool.query(query,[filter]);

    if(result.rowCount === 0){
        throw new ApiError(
            404,
            "User not found"
        );
    }

    const hashedPassword = result.rows[0].password;

    const isMatch = await bcrypt.compare(password,hashedPassword);
    if(!isMatch){
        throw new ApiError(
            401,
            "Invalid credentials"
        );
    }
    
    const accessToken = generateAccessToken(result.rows[0]);
    const refreshToken = generateRefreshToken(result.rows[0]);
        
    query = `
        UPDATE users
        SET refresh_token = $1
        WHERE id = $2
        RETURNING
            id, 
            username,
            email,
            first_name,
            last_name,
            phone,
            role;
    `;
    
    result = await pool.query(
        query,
        [refreshToken,result.rows[0].id]
    );

    if(result.rowCount === 0){
        throw new ApiError(
            400,
            "Failed to login, please try again"
        );
    }

    setAuthCookies(
        res,
        accessToken,
        refreshToken
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    user: result.rows[0]
                },
                "User logged in successfully"
            )
        );

});

const logOut = asyncHandler (async (req, res) => {
    const user = req.user;
    const technician = req.technician || null;

    const client = await pool.connect();

    try{
        await client.query("BEGIN");

        const query = `
            UPDATE users
            SET refresh_token = NULL
            WHERE id = $1;
        `;

        await client.query(query,[user.id]);

        if(technician){
            const query = `
                UPDATE technicians
                SET status = 'offline',
                    last_seen_at = NOW()
                WHERE id = $1;
            `;

            await client.query(query,[technician.id]);
        }

        await client.query("COMMIT");

    }catch(err){
        try{
            await client.query("ROLLBACK");
        }catch(_) {}

        throw new ApiError(
            500,
            "Error while logging out"
        );

    }finally{
        client.release();
    }
    
    clearAuthCookies(res);

    await invalidateCaches(user.id, technician?.id);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Logged out successfully"
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
            SELECT
                id, 
                username,
                email,
                first_name,
                last_name,
                phone,
                role
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
                    {
                        user: user
                    },
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
    register,
    logIn,
    logOut,
    refreshAccessToken,
    forgotPassword,
    verifyForgotOTP,
    resetPassword
};