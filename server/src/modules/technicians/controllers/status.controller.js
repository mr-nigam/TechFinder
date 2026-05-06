import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import pool from '#config/db';
import redisConnection from '#config/redis';

import ApiError from '#shared/utils/apiError';
import ApiResponse from '#shared/utils/apiResponse';
import asyncHandler from '#shared/utils/asyncHandler';
import hashPassword from '#shared/util/password';


const goOnline = asyncHandler(async (req, res) =>{ });
const goOffline = asyncHandler(async (req, res) =>{ });
const updateStatus = asyncHandler(async (req, res) =>{ });


export {
    goOnline,
    goOffline,
    updateStatus
};