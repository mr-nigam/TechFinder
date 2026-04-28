import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import pool from '../db/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import generateAccessToken from '../utils/generateAccessToken.js';
import generateRefreshToken from '../utils/generateRefreshToken.js';

import { 
    uploadOnCloudinary,
    deleteFromCloudinary,
    removeLocalFile 
} from '../utils/cloudinary.js';

import { stat } from 'node:fs';


// Helper Functions
const HashPassword = async(password) => {
    // Learn Regex
    if(password.length<8 || password.length>50){
        throw new ApiError(400,"Password length must be between 8 to 50");
    }

    let checkDigit = false;
    let checkLower = false
    let checkUpper = false;
    let checkSpecChar = false;

    for(const ch of password){
        if(ch >='0' && ch<='9'){
            checkDigit = true;
        }
        else if(ch >='a' && ch<='z'){
            checkLower = true;
        }
        else if(ch >='A' && ch<='Z'){
            checkUpper = true;
        }else if(ch!=' '){
            checkSpecChar = true
        }
    }

    if(
        !checkDigit || 
        !checkLower ||
        !checkUpper || 
        !checkSpecChar
    ){
        throw new ApiError(
            400, 
            "Password must contain uppercase, lowercase, digit and special character"
        );
    }
    return await bcrypt.hash(password,10);
}

const getAccessCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000 // 30 min
});

const getRefreshCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

const formatOwnUser = (user) => ({
    id: user.id,
    username: user.username,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    bio: user.bio,
    profile_picture_url: 
        user.profile_picture_url,
    primary_contact_number: 
        user.primary_contact_number
});

const formatPublicUser = (user) => ({
    id: user.id,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    bio: user.bio,
    profile_picture_url: 
        user.profile_picture_url
});

// ACCOUNT
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

        if(requiredFields.some( field => !field )){
            throw new ApiError(400,"All required fields are not given");
        }

        const isValid = /^[0-9]+$/.test(normalized.primary_contact_number);
        if(!isValid){
            throw new ApiError(400,"Contact number must contain digits only");
        }

        // check email format
        profilePictureLocalPath = req?.file?.path || "";
        const profilePicture = profilePictureLocalPath
            ? await uploadOnCloudinary(profilePictureLocalPath)
            : null;

        let hashPassword = "";
        try{
            hashPassword = await HashPassword(normalized.password,10);   
        }catch(err){
            throw new ApiError(400, err.message);
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
            hashPassword,
        ];

        const result = await pool.query(query, values);

        const user = result.rows[0];

        if(!user){
            throw new ApiError(400,"User registration failed");
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
            throw new ApiError(409, "Email already registered");
            }

            if (err.constraint?.includes("username")) {
            throw new ApiError(409, "Username already taken");
            }

            if (err.constraint?.includes("primary_contact_number")) {
            throw new ApiError(409, "Contact number already in use");
            }

            throw new ApiError(409, "Duplicate record exists");
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

    if(!paswword){
        throw new ApiError(404,"Please enter password");
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
            new ApiResponse(200,{},"User logged Out")
        );
});


// SECURITY
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
        
        const query = `
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

        const updateQuery = `
            UPDATE users
            SET refresh_token = $1,
                updated_at = NOW()
            WHERE id = $2;
        `;

        await pool.query(updateQuery,[refreshToken, user.id]);
        
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

const changeCurrentPassword = asyncHandler(async (req, res) => {
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
        SELECT id, password
        FROM users
        WHERE id = $1
            AND is_deleted = false
        LIMIT 1;
    `;

    let result = await pool.query(
        query,
        [req.user.id]
    );

    let user = result.rows[0];

    if(!user){
        throw new ApiError(
            404,
            "invalid credentials"
        );
    }

    const isMatch = await bcrypt.compare(oldPassword,user.password);
    if(!isMatch){
        throw new ApiError(
            401,
            "Invalid credentials"
        );
    }

    const newHashPassword = await HashPassword(newPassword);
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    query = `
        UPDATE users
        set password = $1,
            refresh_token = $2,
            password_changed_at = NOW(),
            updated_at = NOW()
        WHERE id = $3
        RETURNING *;
    `;

    const values = [
        newHashPassword,
        refreshToken,
        req.user.id,
    ];
    
    result = await pool.query(
        query,
        values
    );

    user = result.rows[0];

    if(!user){
        throw new ApiError(
            404,
            "invalid credentials"
        );
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,getAccessCookieOptions())
    .cookie("refreshToken",refreshToken,getRefreshCookieOptions())
    .json(
        new ApiResponse(
            200,
            {user: formatOwnUser(user)},
            "Password changed successfully"
        )
    );
    
});

const forgotPassword = asyncHandler(async (req, res) => {});
const resetPassword = asyncHandler(async (req, res) => {});


// EMAIL VERIFICATION
const verifyEmail = asyncHandler(async (req, res) => {});
const changeEmail = asyncHandler(async (req, res) => {});
const resendEmailVerification = asyncHandler(async (req, res) => {});


// PROFILE MANAGEMENT
const getMyProfile = asyncHandler(async (req, res) => {});
const updateUserProfile = asyncHandler(async (req, res) => {});
const updateProfilePicture = asyncHandler(async (req, res) => {});
const removeProfilePicture = asyncHandler(async (req, res) => {});
const updateCurrentLocation = asyncHandler(async, (req,res) => {
    const {
        current_location: {
            lat,
            lng,
            accuracy = null,
            captured_at = null
        } = {}
    } = req.body || {};

    const query = `
        INSERT INTO users (
            current_location,
            current_location_captured_at,
            current_location_accuracy_meters
        )
        VALUES (
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
            $3,
            $4
        )
        RETURNING *;
        `;
});

// ADDRESSES
const addAddress = asyncHandler(async (req, res) => {});
const getMyAddresses = asyncHandler(async (req, res) => {});
const updateAddress = asyncHandler(async (req, res) => {});
const deleteAddress = asyncHandler(async (req, res) => {});
const changeDefaultAddress = asyncHandler(async (req, res) => {});


// CONTACT NUMBERS
const addContactNumber = asyncHandler(async (req, res) => {});
const getMyContactNumbers = asyncHandler(async (req, res) => {});
const deleteContactNumber = asyncHandler(async (req, res) => {});
const verifyContactNumber = asyncHandler(async (req, res) => {});
const changePrimaryContactNumber = asyncHandler(async (req, res) => {});


//DEACTIVATE ACCOUNT - use redis for this
const deactivateAccount = asyncHandler(async (req, res) => {});


export {
    // Account
    registerUser,
    logInUser,
    logOutUser,
    
    //SECURITY 
    refreshAccessToken,
    forgotPassword,
    resetPassword,
    changeCurrentPassword,
    
    // EMAIL VERIFICATION
    verifyEmail,
    changeEmail,
    resendEmailVerification,

    // PROFILE MANAGEMENT
    getMyProfile,
    updateUserProfile,
    updateProfilePicture,
    removeProfilePicture,
    
    // ADDRESS
    addAddress,
    getMyAddresses,
    updateAddress,
    deleteAddress,
    changeDefaultAddress,
    
    // CONTACT NUMBERS
    addContactNumber,
    getMyContactNumbers,
    deleteContactNumber,
    verifyContactNumber,
    changePrimaryContactNumber,

    //DEACTIVATE ACCOUNT
    deactivateAccount
};
