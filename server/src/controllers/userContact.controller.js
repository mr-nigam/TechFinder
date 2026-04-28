import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import pool from '../db/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';

import { stat } from 'node:fs';

// Utility Functions
import {
    hashPassword,
    hasEmpty
} from '../utils/user.utils.js';


const addContactNumber = asyncHandler(async (req, res) => {});
const getMyContactNumbers = asyncHandler(async (req, res) => {});
const deleteContactNumber = asyncHandler(async (req, res) => {});
const verifyContactNumber = asyncHandler(async (req, res) => {});
const changePrimaryContactNumber = asyncHandler(async (req, res) => {});


export {
    addContactNumber,
    getMyContactNumbers,
    deleteContactNumber,
    verifyContactNumber,
    changePrimaryContactNumber,
};