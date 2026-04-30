import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '#config/db';
import asyncHandler from '#utils/asyncHandler';
import ApiError from '#utils/apiError';
import ApiResponse from '#utils/apiResponse';


//use redis/bullmq for these for lazy deletion and 
// propagation of delete to all user associted data
const deactivateAccount = asyncHandler(async (req, res) => {
    const password = req.body.password?.trim() || "";
    const userId = req.user.id;

    if(!password){
        throw new ApiError(
            404,
            "Please enter password"
        );
    }

    let query = `
        SELECT 
        password
        FROM users
        WHERE id = $1
            AND is_deactivated = false
            AND is_deleted = false;
    `;

    let result = await pool.query(
        query,
        [userId]
    );

    if(result.rows.length === 0){
        throw new ApiError(
            404,
            "User does not exist"
        );
    }

    let oldHashedpassword = result.rows[0].password;


    let isMatch = await bcrypt.compare(password, oldHashedpassword);

    if(!isMatch){
        throw new ApiError(
            401,
            "Invalid credentials"
        );
    }

    query = `
        UPDATE users
        set is_deactivated = true
        WHERE id = $1;
    `;
    
    result = await pool.query(
        query,
        [userId]
    );

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "User deactivated successfully"
        )
    )
});

const reactivateAccount = asyncHandler(async (req, res) => {});
const deleteAccount = asyncHandler(async (req, res) => {
});


export {
    deactivateAccount,
    reactivateAccount,
    deleteAccount
}

