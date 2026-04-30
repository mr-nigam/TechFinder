import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import pool from '#config/db';

import ApiError from '#utils/apiError';
import ApiResponse from '#utils/apiResponse';
import asyncHandler from '#utils/asyncHandler';

import hashPassword from '#util/password';

import { 
    uploadOnCloudinary,
    deleteFromCloudinary,
    removeLocalFile 
} from '#utils/cloudinary.util';

import {
    formatOwnUser,
} from '#utils/user.utils';

import {
    generateAccessToken,
    generateRefreshToken
} from '#utils/tokens.util';

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
            primary_contact_number = "",
            country_code = "",
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
            primary_contact_number: primary_contact_number.trim(),
            country_code: country_code.trim()
        };

        const requiredFields = [
            normalized.email,
            normalized.username,
            normalized.first_name,
            normalized.last_name,
            normalized.password,
            normalized.primary_contact_number,
            normalized.country_code
        ];

        if(hasEmpty(requiredFields)){
            throw new ApiError(
                400,
                "All required fields are not given"
            );
        }

        const isValid = /^[0-9]+$/.test(normalized.primary_contact_number);
        if(!isValid){
            throw new ApiError(
                400,
                "Contact number must contain digits only"
            );
        }

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
                primary_contact_number, country_code, 
                gender, bio, date_of_birth, 
                profile_picture_publicid, 
                profile_picture_url, 
                password
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *;
        `;

        const values = [
            normalized.username,
            normalized.email,
            normalized.first_name, 
            normalized.last_name,
            normalized.primary_contact_number,
            normalized.country_code,
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

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
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

            if (err.constraint?.includes("primary_contact_number")) {
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
    const username = req.body.username?.trim();
    const primary_contact_number = req.body.primary_contact_number?.trim()|| "";
    const password = req.body.paswword?.trim() || "";

    if(!email && !username && !primary_contact_number){
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

    let filter = "";
    if(email) filter = email; 
    if(username) filter = username; 
    if(primary_contact_number) filter = primary_contact_number; 

    let query = `
        SELECT id, username, email, password 
        FROM users
        WHERE email = $1
            OR username = $1
            OR primary_contact_number = $1
        LIMIT 1; 
    `;
    
    let result = await pool.query(query,[filter]);

    let user = result.rows[0];

    if(!user){
        throw new ApiError(
            400,
            "Invalid credentials"
        );
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
    
    const query = `
        UPDATE users
        SET refresh_token = $1,
            updated_at = NOW()
        WHERE id = $2
        RETURNING *;
    `;
    result = await pool.query(query,[refreshToken,user.id]);
    
    user = result.rows[0]

    return res
    .status(201)
    .cookie("accessToken",accessToken,getAccessCookieOptions())
    .cookie("refreshToken",refreshToken,getRefreshCookieOptions())
    .json(
        new ApiResponse(
            201,
            {user: formatOwnUser(user)},
            "User logged in successfully"
        )
    );

});

const logOutUser = asyncHandler (async (req, res) => {
    const query = `
        UPDATE users
        SET refresh_token = NULL,
            update_at = NOW()
        WHERE id = $1;
    `;

    await pool.query(query,[req.user.id]);

    return res
        .status(200)
        .clearCookie("accessToken",getAccessCookieOptions())
        .clearCookie("refreshToken",getRefreshCookieOptions())
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
                AND is_deleted = false
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
            SET refresh_token = $1,
                updated_at = NOW()
            WHERE id = $2;
        `;

        await pool.query(query,[refreshToken, user.id]);
        
        return res
        .status(201)
        .cookie("accessToken",accessToken,getAccessCookieOptions())
        .cookie("refreshToken",refreshToken,getRefreshCookieOptions())
        .json(
            new ApiResponse(
                201,
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


