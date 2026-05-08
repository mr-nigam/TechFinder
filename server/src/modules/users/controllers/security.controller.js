import bcrypt from 'bcrypt';
import pool from '#config/db.js';

import {
    getCache,
    deleteCache,
    invalidateCaches
} from '#lib/cache';


import {
    ApiError,
    ApiResponse,
    asyncHandler,

    hashPassword,

    generateAccessToken,
    generateRefreshToken,
    getAccessCookieOptions,
    getRefreshCookieOptions,
    
    hasEmpty,
    isValidUUID,
    isValidPhone,
    isValidEmail,
    
    uploadOnCloudinary,
    removeLocalFile
} from '#shared';

import {
    otpQueue,
    emailQueue
} from '#queues';



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
    const email = req.body?.email?.trim() || "";
    
    if(!email || !isValidEmail(email)){
        throw new ApiError(
            400,
            "Please enter email address"
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

        result = await pool.query(query,[email,user.id]);

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
            "otp:verify:email",
            {
                userId: user.id,
                email: email,
            },
            {
                jobId: `otp:verify:email:${user.id}`
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
    const phone = req.body?.phone?.trim() || "";
    
    if(!phone || !isValidPhone(phone)){
        throw new ApiError(
            400,
            "Please enter phone number"
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

        result = await pool.query(query,[phone,user.id]);

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
    
    if(user.is_phone_verified) {
        throw new ApiError(
            400,
            "Phone number already verified"
        );
    }

    const phone = user?.phone?.trim() || "";


    try{
        await otpQueue.add(
            "otp:verify:phone",
            {
                userId: user.id,
                phone: phone,
            },
            {
                jobId: `otp:verify:phone:${user.id}`
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

const verifyPhone = asyncHandler(async (req, res) => { 
    const user = req.user;
    
    const otp = req.body?.otp?.trim() || "";

    if(!otp){
        throw new ApiError(
            400,
            "Please enter OTP"
        );
    }

    const phoneOtpKey = `otp:verify:phone:${user.id}`;

    const storedOtp = await getCache(phoneOtpKey);
    
    let message = "Wrong OTP, please enter OTP again.";

    let verificationResult = {};

    if(!storedOtp){
        message = "OTP got expired, please request OTP again.";

    }else if(String(storedOtp) === String(otp)){

        const query = `
            UPDATE users
            SET is_phone_verified = TRUE
            WHERE id = $1
            RETURNING
                id,
                phone,
                is_phone_verified;
        `;

        const result = await pool.query(query,[user.id]);

        if(result.rowCount === 0){
            throw new ApiError(
                500,
                "Failed to verify primary phone number"
            );
        }

        verificationResult = result.rows[0];
        
        message = "Primary phone number verified successfully";
        
        await deleteCache(phoneOtpKey);
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
    changePassword,
    changeEmail,
    sendEmailOtp,
    verifyEmail,
    changePhone,
    sendPhoneOtp,
    verifyPhone
};
