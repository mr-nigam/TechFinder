import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import pool from '../db/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import generateAccessToken from '../utils/generateAccessToken.js';
import generateRefreshToken from '../utils/generateRefreshToken.js';


// ACCOUNT
const registerTechnician = asyncHandler(async (req, res) => {});
const logInTechnician = asyncHandler (async (req, res) => { });
const logOutTechnician = asyncHandler (async (req, res) => { });

const getTechnicianPublicProfile = asyncHandler(async (req, res) => {});



export {
    getTechnicianPublicProfile
}
