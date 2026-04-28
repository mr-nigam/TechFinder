import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import pool from '../db/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';

import { stat } from 'node:fs';

import { 
    uploadOnCloudinary,
    deleteFromCloudinary,
    removeLocalFile 
} from '../utils/cloudinary.js';

// Utility Functions
import {
    hashPassword,
    getAccessCookieOptions,
    getRefreshCookieOptions,
    formatOwnUser,
    formatPublicUser,
    hasEmpty
} from '../utils/user.utils.js';


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