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
                user,
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

const logInUser = asyncHandler (async (req, res) => {});
const logOutUser = asyncHandler (async (req, res) => {});


// SECURITY
const refreshAccessToken = asyncHandler (async (req, res) => {}); 
const forgotPassword = asyncHandler(async (req, res) => {});
const resetPassword = asyncHandler(async (req, res) => {});
const changeCurrentPassword = asyncHandler(async (req, res) => {});


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
