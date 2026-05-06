import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import pool from '#config/db';
import redisConnection from '#config/redis';

import ApiError from '#shared/utils/apiError';
import ApiResponse from '#shared/utils/apiResponse';
import asyncHandler from '#shared/utils/asyncHandler';
import hashPassword from '#shared/util/password';


const uploadDocument = asyncHandler(async (req, res) =>{ });
const verifyDocument = asyncHandler(async (req, res) =>{ });
const deleteDocument = asyncHandler(async (req, res) =>{ });
const getVerificationStatus = asyncHandler(async (req, res) =>{ });
const verifyTechnician = asyncHandler(async (req, res) =>{ });


export {
    uploadDocument,
    verifyDocument,
    deleteDocument,
    getVerificationStatus,
    verifyTechnician
}