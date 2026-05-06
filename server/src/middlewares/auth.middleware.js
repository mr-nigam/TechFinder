import jwt from 'jsonwebtoken';
import pool from '#config/db';
import ApiError from '#utils/apiError';
import asyncHandler from '#utils/asyncHandler';


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

    let query = `
        SELECT 
            to_jsonb(users)
            - 'password'
            - 'refresh_token' AS user
        WHERE id = $1
        FROM users
            AND deleted_at IS NULL
            AND deactivated_at IS NULL
            AND status = 'active';
    `;

    let result = await pool.query(query,[decodedToken?.id]);
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

    query = `
        SELECT
            id,
            specialization,
            status,
            verification_status,
            last_seen_at
        FROM technicians
        WHERE user_id = $1
            AND deleted_at IS NULL
            AND deactivated_at IS NULL
        LIMIT 1;
    `;

    const techie = await pool.query(query, [user.id]);

    if(techie.rowCount >0) {
        req.technician = techie.rows[0];
    }

    next(); 
});


export default verifyJWT;