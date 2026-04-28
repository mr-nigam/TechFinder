import jwt from 'jsonwebtoken';
import pool from '../db/db.js';
import ApiError from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';


const verifyJWT = asyncHandler(async (req, _, next) => {
    // 1. Extract token safely
    const authHeader = req.header("Authorization");

    const token =
        req?.cookies?.accessToken ||
        (authHeader?.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : null);

    if(!token){
        throw new ApiError(
            401,
            "Access token is missing"
        );
    }

    let decodedToken;

    // 3. Verify token
    try{
        decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );
    }catch(err){
        throw new ApiError(
            401,
            "Invalid or expired access token"
        );
    }

    const query = `
        SELECT 
            to_jsonb(users)
            - 'password'
            - 'refresh_token' AS user
        WHERE id = $1
            AND is_deleted = false
            AND status = 'active';
    `;

    const result = await pool.query(query,[decodedToken?.id]);
    const user =  result.rows[0];
    
    if(!user){
        throw new ApiError(
            401,
            "User not found or token invalid"
        );
    }

    // TOKEN INVALID AFTER PASSWORD CHANGE
    const passwordChangedAt = user.password_changed_at; 

    if(passwordChangedAt){
        const tokenIssuedAtMs =
            decodedToken.iat * 1000;

        const passwordChangedAtMs =
            new Date(
                passwordChangedAt
            ).getTime();

        if(tokenIssuedAtMs < passwordChangedAtMs){
            throw new ApiError(
                401,
                "Password changed. Please login again"
            );
        }
    }

    req.user = user;
    next();
    
});


export default verifyJWT;