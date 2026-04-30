import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '#config/db';
import asyncHandler from '#utils/asyncHandler';
import ApiError from '#utils/apiError';
import ApiResponse from '#utils/apiResponse';



const changeCurrentPassword = asyncHandler(async (req, res) => {
    const{oldPassword, newPassword} = req.body;

    if(!oldPassword || !newPassword){
        throw new ApiError(
            400, 
            "Old and new password are required"
        );
    }
    
    if(oldPassword === newPassword){
        throw new ApiError(
            400,
            "New password must be different"
        );
    }

    let query = `
        SELECT id, password
        FROM users
        WHERE id = $1
            AND is_deleted = false
        LIMIT 1;
    `;

    let result = await pool.query(
        query,
        [req.user.id]
    );

    let user = result.rows[0];

    if(!user){
        throw new ApiError(
            404,
            "invalid credentials"
        );
    }

    const isMatch = await bcrypt.compare(oldPassword,user.password);
    if(!isMatch){
        throw new ApiError(
            401,
            "Invalid credentials"
        );
    }

    const newHashedPassword = await hashPassword(newPassword);
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    query = `
        UPDATE users
        set password = $1,
            refresh_token = $2,
            password_changed_at = NOW(),
            updated_at = NOW()
        WHERE id = $3
        RETURNING *;
    `;

    const values = [
        newHashedPassword,
        refreshToken,
        req.user.id,
    ];
    
    result = await pool.query(
        query,
        values
    );

    user = result.rows[0];

    if(!user){
        throw new ApiError(
            404,
            "invalid credentials"
        );
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,getAccessCookieOptions())
    .cookie("refreshToken",refreshToken,getRefreshCookieOptions())
    .json(
        new ApiResponse(
            200,
            {user: formatOwnUser(user)},
            "Password changed successfully"
        )
    );
    
});

const verifyEmail = asyncHandler(async (req, res) => {});
const changeEmail = asyncHandler(async (req, res) => {});
const resendEmailVerification = asyncHandler(async (req, res) => {});


export {
    changeCurrentPassword,
    verifyEmail,
    changeEmail,
    resendEmailVerification,
};
