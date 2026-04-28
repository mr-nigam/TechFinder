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


//DEACTIVATE ACCOUNT - use redis for this
const deactivateAccount = asyncHandler(async (req, res) => {});
const deleteAccount = asyncHandler(async (req, res) => {});
const reactivateAccount = asyncHandler(async (req, res) => {});



export {
    deactivateAccount
}

