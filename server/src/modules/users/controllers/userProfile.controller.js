import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '#config/db';
import asyncHandler from '#utils/asyncHandler';
import ApiError from '#utils/apiError';
import ApiResponse from '#utils/apiResponse';


import hashPassword from '#util/password';
import formatOwnUser from '#user/password';

import { 
    uploadOnCloudinary,
    deleteFromCloudinary,
    removeLocalFile 
} from '#utils/cloudinary.util';

import {
    hasEmpty,
    isValidUUID
} from '#utils/validation.utils';

import {
    generateAccessToken,
    generateRefreshToken
} from '#utils/tokens.util';


const getMyProfile = asyncHandler(async (req, res) => {
    const query = `
        SELECT
            username,
            first_name,
            last_name,
            email,
            primary_phone_number,
            country_code,
            is_primary_phone_number_verified,
            gender,
            profile_picture_url,
            bio,
            is_email_verified,
            role,
            status
        FROM users
        WHERE id = $1
          AND NOT is_deleted
          AND NOT is_deactivated;
    `;

    const { rows } = await pool.query(
        query, 
        [req.user.id]
    );

    const user = rows[0];

    if (!user) {
        throw new ApiError(
            404, 
            "User not found"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "User profile fetched successfully"
        )
    );
});


const updateUserProfile = asyncHandler(async (req, res) => {});
const updateProfilePicture = asyncHandler(async (req, res) => {});
const updateCurrentLocation = asyncHandler(async, (req,res) => { });


export{
    getMyProfile,
    updateUserProfile,
    updateProfilePicture,
    updateCurrentLocation,
}