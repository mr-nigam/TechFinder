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


const getMyProfile = asyncHandler(async (req, res) => {});
const updateUserProfile = asyncHandler(async (req, res) => {});
const updateProfilePicture = asyncHandler(async (req, res) => {});
const updateCurrentLocation = asyncHandler(async, (req,res) => { });


export{
    getMyProfile,
    updateUserProfile,
    updateProfilePicture,
    updateCurrentLocation,
}