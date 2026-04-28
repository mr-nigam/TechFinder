import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import pool from '../db/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import generateAccessToken from '../utils/generateAccessToken.js';
import generateRefreshToken from '../utils/generateRefreshToken.js';


// ACCOUNT
const registerUser = asyncHandler(async (req, res) => {});
const logInUser = asyncHandler (async (req, res) => {});
const logOutUser = asyncHandler (async (req, res) => {});


// SECURITY
const refreshAccessToken = asyncHandler (async (req, res) => {}); 
const forgotPassword = asyncHandler(async (req, res) => {});
const resetPassword = asyncHandler(async (req, res) => {});
const changeCurrentPassword = asyncHandler(async (req, res) => {});


// EMAIL VERIFICATION
const verifyEmail = asyncHandler(async (req, res) => {});
const changeEmail = asyncHandler(async (req, res) => {});
const resendEmailVerification = asyncHandler(async (req, res) => {});


// PROFILE MANAGEMENT
const getMyProfile = asyncHandler(async (req, res) => {});
const updateUserProfile = asyncHandler(async (req, res) => {});
const updateProfilePicture = asyncHandler(async (req, res) => {});
const removeProfilePicture = asyncHandler(async (req, res) => {});


// ADDRESSES
const addAddress = asyncHandler(async (req, res) => {});
const getMyAddresses = asyncHandler(async (req, res) => {});
const updateAddress = asyncHandler(async (req, res) => {});
const deleteAddress = asyncHandler(async (req, res) => {});
const changePrimaryAddress = asyncHandler(async (req, res) => {});


// CONTACT NUMBERS
const addContactNumber = asyncHandler(async (req, res) => {});
const getMyContactNumbers = asyncHandler(async (req, res) => {});
const deleteContactNumber = asyncHandler(async (req, res) => {});
const verifyContactNumber = asyncHandler(async (req, res) => {});
const changePrimaryContactNumber = asyncHandler(async (req, res) => {});


//DEACTIVATE ACCOUNT - use redis for this
const deactivateAccount = asyncHandler(async (req, res) => {});


export {
    // Account
    registerUser,
    logInUser,
    logOutUser,
    
    //SECURITY 
    refreshAccessToken,
    forgotPassword,
    resetPassword,
    changeCurrentPassword,
    
    // EMAIL VERIFICATION
    verifyEmail,
    changeEmail,
    resendEmailVerification,

    // PROFILE MANAGEMENT
    getMyProfile,
    updateUserProfile,
    updateProfilePicture,
    removeProfilePicture,
    
    // ADDRESS
    addAddress,
    getMyAddresses,
    updateAddress,
    deleteAddress,
    changePrimaryAddress,
    
    // CONTACT NUMBERS
    addContactNumber,
    getMyContactNumbers,
    deleteContactNumber,
    verifyContactNumber,
    changePrimaryContactNumber,

    //DEACTIVATE ACCOUNT
    deactivateAccount
};
