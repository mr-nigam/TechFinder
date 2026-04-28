import bcrypt from "bcrypt";
import pool from '../db/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';


const SALT_ROUNDS = 10;

const hashPassword = async(password) => {
    // Learn Regex
    if(password.length<8 || password.length>50){
        throw new ApiError(
            400,
            "Password length must be between 8 to 50"
        );
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
    return await bcrypt.hash(password,SALT_ROUNDS);
};

const getAccessCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 60 * 1000 // 30 min
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


export {
    hashPassword,
    getAccessCookieOptions,
    getRefreshCookieOptions,
    formatOwnUser,
    formatPublicUser,
};
