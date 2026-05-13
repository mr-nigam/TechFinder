import bcrypt from 'bcrypt';
import pool from 
'#config/database/postgres.js';

import {
    ApiError,
    ApiResponse,
    asyncHandler,

    hashPassword,

    generateAccessToken,
    generateRefreshToken,
    getAccessCookieOptions,
    getRefreshCookieOptions,
    
    isValidPhone,
    isValidEmail,
    
} from '#shared';

import {
    emailQueue
} from '#queues';

import {
    otpQueue,
    
    getCache,
    deleteCache,
    invalidateCaches
} from '#infra';



const resetPassword = asyncHandler(async (req, res) => {
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
            role,
            email;
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

    await invalidateCaches(
        user.id,
        req.technician?.id || null
    );

    try{
        await emailQueue.add(
            "password-reset",
            { 
                userId: user.id
            },
            {
                jobId: `password-reset:${user.id}`
            }
        );
        console.log("Password Reset");
    }catch(err){
        console.error("Queue error:", err.message);
    }

    return res
        .status(200)
        .cookie(
            "accessToken",
            accessToken,
            getAccessCookieOptions()
        )
        .cookie(
            "refreshToken",
            refreshToken,
            getRefreshCookieOptions()
        )
        .json(
            new ApiResponse(
                200,
                {user: result.rows[0]},
                "Password changed successfully"
            )
        );
    
});

const changeEmail = asyncHandler(async (req, res) => { 
    const user = req.user;
    const newEmail = req.body?.email?.trim() || "";
    
    if(!newEmail || !isValidEmail(newEmail)){
        throw new ApiError(
            400,
            "Please enter email address"
        );
    }
    
    const oldEmail = user.email; 
    
    if(oldEmail === newEmail){
        throw new ApiError(
            400,
            "New email must be different"
        );
    }

    let result;
    try{
        const query = `
            UPDATE users
            SET email = $1,
                is_email_verified = FALSE
            WHERE id = $2
            RETURNING
                id,
                username,
                email,
                is_email_verified;
        `;

        result = await pool.query(
            query,
            [newEmail,user.id]
        );

        if(result.rowCount === 0){
            throw new ApiError(
                400,
                "Failed to update the email, please try again"
            );
        }

    }catch(err){
        if(err.code === "23505"){
            throw new ApiError(
                400,
                "Email already in use"
            );
        }
        
        throw new ApiError(
            err.statusCode || 400,
            err.message || "Failed to update the email, please try again"
        );
    }
    

    await invalidateCaches(
        user.id,
        req.technician?.id || null
    );

    try{
        await emailQueue.add(
            "email-changed",
            { 
                userId: user.id,
                oldEmail: oldEmail
            },
            {
                jobId: `email-changed:${user.id}`
            }
        );
        console.log("Email Changed");
    }catch(err){
        console.error("Queue error:", err.message);
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                result.rows[0],
                "Email updated successfully"
            )
        );
});

const sendEmailOtp = asyncHandler(async (req, res) => {
    const user = req.user;

    if(user.is_email_verified){
        throw new ApiError(
            400,
            "Email already verified"
        );
    }

    const email = user?.email?.trim() || "";

    try{
        await otpQueue.add(
            "verify:email",
            {
                userId: user.id,
                username: user.username,
                email: email,
            },
            {
                jobId: `verify:email:${user.id}`
            }
        );
        
        console.log("OTP job enqueued successfully");

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "OTP sent successfully"
                )
            );

    }catch(err){

        console.error("Queue error:", err.message);

        throw new ApiError(
            500,
            "Failed to send OTP"
        );
    }
});

const verifyEmail = asyncHandler(async (req, res) => { 
    const user = req.user;
    
    const otp = req.body?.otp?.trim() || "";

    if(!otp){
        throw new ApiError(
            400,
            "Please enter OTP"
        );
    }

    const emailOtpKey = `otp:verify:email:${user.id}`;

    const storedOtp = await getCache(emailOtpKey);
    
    let message = "Wrong OTP, please enter OTP again."
    
    let verificationResult = {};

    if(!storedOtp){
        message = "OTP got expired, please request OTP again."

    }else if(String(storedOtp) === String(otp)){

        const query = `
            UPDATE users
            SET is_email_verified = TRUE
            WHERE id = $1
            RETURNING
                id,
                email,
                is_email_verified;
        `;

        const result = await pool.query(query,[user.id]);

        if(result.rowCount === 0){
            throw new ApiError(
                500,
                "Failed to verify email"
            );
        }

        verificationResult = result.rows[0];
        
        message = "Email verified successfully";
        
        await deleteCache(emailOtpKey);
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                verificationResult,
                message
            )
        );
});

const changePhone = asyncHandler(async (req, res) => { 
    const user = req.user;
    const newPhone = req.body?.phone?.trim() || "";
    
    if(!newPhone || !isValidPhone(newPhone)){
        throw new ApiError(
            400,
            "Please enter phone number"
        );
    }

    const oldPhone = user.phone; 
    
    if(oldPhone === newPhone){
        throw new ApiError(
            400,
            "New phone number must be different"
        );
    }

    let result;
    try{
        const query = `
            UPDATE users
            SET phone = $1,
                is_phone_verified = FALSE
            WHERE id = $2
            RETURNING
                id,
                username,
                phone,
                is_phone_verified;
        `;

        result = await pool.query(
            query,
            [newPhone,user.id]
        );

        if(result.rowCount === 0){
            throw new ApiError(
                400,
                "Failed to update the primary phone number, please try again"
            );
        }

    }catch(err){
        if(err.code === "23505"){
            throw new ApiError(
                400,
                "Phone number already in use"
            );
        }
        
        throw new ApiError(
            err.statusCode || 400,
            err.message || "Failed to update the primary phone number, please try again"
        );
    }
    
    await invalidateCaches(
        user.id,
        req.technician?.id || null
    );

    try{
        await emailQueue.add(
            "phone-changed",
            { 
                userId: user.id,
                oldPhone: oldPhone
            },
            {
                jobId: `phone-changed:${user.id}`
            }
        );

        console.log("Phone Changed");
    }catch(err){
        console.error("Queue error:", err.message);
    }
    
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                result.rows[0],
                "Primary phone number updated successfully"
            )
        );
});

const sendPhoneOtp = asyncHandler(async (req, res) => {
    const user = req.user;
    
    if(user.is_phone_verified){
        throw new ApiError(
            400,
            "Phone number already verified"
        );
    }

    try{
        await otpQueue.add(
            "verify:phone",
            {
                userId: user.id,
                phone: user.phone
            },
            {
                jobId: `verify:phone:${user.id}`
            }
        );
        
        console.log("OTP job enqueued successfully");

    }catch(err){
        console.error("Queue error:", err.message);

        throw new ApiError(
            500,
            "Failed to send OTP"
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "OTP sent successfully"
            )
        );
});

const verifyPhone = asyncHandler(async (req, res) => { 
    const user = req.user;
    const otp = req.body?.otp?.trim() || "";

    if(!otp){
        throw new ApiError(
            400,
            "Please enter OTP"
        );
    }

    const verifyPhoneKey = `verify:phone:${user.id}`;

    const storedOtp = await getCache(verifyPhoneKey);
    
    let message = "Wrong OTP, please enter OTP again.";

    let verificationResult = {};

    if(!storedOtp){
        message = "OTP got expired, please request OTP again.";

    }else if(String(storedOtp) === String(otp)){

        const query = `
            UPDATE users
            SET is_phone_verified = TRUE
            WHERE id = $1
                AND deleted_at IS NULL
            RETURNING
                id,
                phone,
                is_phone_verified;
        `;

        const result = await pool.query(
            query,
            [user.id]
        );

        if(result.rowCount === 0){
            throw new ApiError(
                500,
                "Failed to verify primary phone number"
            );
        }

        verificationResult = result.rows[0];
        
        message = "Primary phone number verified successfully";
        
        await deleteCache(verifyPhoneKey);
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                verificationResult,
                message
            )
        );
});


export {
    resetPassword,
    changeEmail,
    sendEmailOtp,
    verifyEmail,
    changePhone,
    sendPhoneOtp,
    verifyPhone
};