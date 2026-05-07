import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import pool from '#config/db';
import redisConnection from '#config/redis';
import ApiError from '#shared/utils/apiError';
import ApiResponse from '#shared/utils/apiResponse';
import asyncHandler from '#shared/utils/asyncHandler';
import hashPassword from '#shared/util/password';


const approveDocument = asyncHandler(async (req, res) => {});
const rejectDocument = asyncHandler(async (req, res) => {});
const verifyTechnician = asyncHandler(async (req, res) => {});
const suspendAccount = asyncHandler(async (req, res) => {});
const dashboard = asyncHandler(async (req, res) => {});


export {
    approveDocument,
    rejectDocument,
    verifyTechnician,
    suspendAccount,
    dashboard
};