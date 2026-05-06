import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import pool from '#config/db';
import redisConnection from '#config/redis';

import ApiError from '#shared/utils/apiError';
import ApiResponse from '#shared/utils/apiResponse';
import asyncHandler from '#shared/utils/asyncHandler';
import hashPassword from '#shared/util/password';


const getAssigned = asyncHandler(async (req, res) =>{ });
const getHistory = asyncHandler(async (req, res) =>{ });
const accept = asyncHandler(async (req, res) =>{ });
const reject = asyncHandler(async (req, res) =>{ });
const start = asyncHandler(async (req, res) =>{ });
const complete = asyncHandler(async (req, res) =>{ });
const cancel = asyncHandler(async (req, res) =>{ });


export {
    getAssigned,
    getHistory,
    accept,
    reject,
    start,
    complete,
    cancel
};