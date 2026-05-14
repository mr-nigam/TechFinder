import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import crypto from 'crypto';

import pool from 
'#config/database/postgres.js';

import {
    otpQueue,
    setCache,
    getCache,
    deleteCache,
    invalidateCaches
} from '#infra';

import {
    ApiError,
    ApiResponse,
    asyncHandler,

    hashPassword,
    
    generateAccessToken,
    generateRefreshToken,
    setAuthCookies,
    clearAuthCookies,
    
    normalizeRegisterData,
    validateRegisterData,
    generateHashedPassword,
    
    removeLocalFile
} from '#shared';

import {
    cleanupQueue,
    emailQueue
} from '#queues';

import {
    uploadOnCloudinary
} from '#services';

import {
    createUser
} from '#repositories/auth.repository.js';


const register = asyncHandler(async (req, res) => {
    let localPath = req?.file?.path || "";
    let public_id = "";

    try{
        const normalized = normalizeRegisterData(body);

        validateRegisterData(normalized);

        const hashedPassword =
            await generateHashedPassword(normalized.password);

        const profilePicture = localPath
            ? await uploadOnCloudinary(localPath)
            : null;
        
        public_id = profilePicture?.public_id || "";

        const user = await createUser({
            ...normalized,
            password: hashedPassword
        });


        if(!user){
            throw new ApiError(
                400,
                "User registration failed"
            );
        }

        try{
            await emailQueue.add(
                "welcome", 
                { 
                    userId: user.id
                },
                {
                    jobId: `welcome:${user.id}`,
                }
            );
        }catch(_) {}

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    {user: result.rows[0]},
                    "User registered successfully"
                )
            );

    }catch(err){
        try{
            await removeLocalFile(localPath);
        }catch(_) {}

        try{
            await cleanupQueue.add(
                "cloudinary:file:delete", 
                { 
                    public_id: public_id,
                    resourceType: "image"
                },
                {
                    jobId: `cloudinary:file:delete:${public_id}`
                }
            );
        }catch(_) {}

        if(err.code === "23505"){
            if (err.constraint?.includes("email")) {
                throw new ApiError(
                    409,
                    "Email already registered"
                );
            }

            if (err.constraint?.includes("username")) {
                throw new ApiError(
                    409,
                    "Username already taken"
                );
            }

            if (err.constraint?.includes("phone")) {
                throw new ApiError(
                    409,
                    "Contact number already in use"
                );
            }

            throw new ApiError(
                409,
                "Duplicate record exists"
            );
        }
        
        throw new ApiError(
            err.statusCode || 500,
            err.message || "User registeration falied"
        );
    }
});

const logIn = asyncHandler (async (req, res) => {
    const email = req.body.email?.trim().replace(/"/g, "") || "";
    const username = req.body.username?.trim() || "";
    const phone = req.body.phone?.trim()|| "";
    const password = req.body.password?.trim() || "";

    if(!email && !username && !phone){
        throw new ApiError(
            400,
            "Please provide email, username, phone number"
        );
    }

    if(!password){
        throw new ApiError(
            400,
            "Please enter password"
        );
    }

    
    const filter = email || username || phone; 

    let query = `
        SELECT 
            id,
            username,
            email, 
            password 
        FROM users
            WHERE (email = $1
                    OR username = $1
                    OR phone = $1
                )
                AND deleted_at IS NULL
                AND deactivated_at IS NULL
        LIMIT 1; 
    `;
        
    let result = await pool.query(query,[filter]);

    if(result.rowCount === 0){
        throw new ApiError(
            404,
            "User not found"
        );
    }

    const hashedPassword = result.rows[0].password;

    const isMatch = await bcrypt.compare(password,hashedPassword);
    if(!isMatch){
        throw new ApiError(
            401,
            "Invalid credentials"
        );
    }
    
    const accessToken = generateAccessToken(result.rows[0]);
    const refreshToken = generateRefreshToken(result.rows[0]);
        
    query = `
        UPDATE users
        SET refresh_token = $1
        WHERE id = $2
        RETURNING
            id, 
            username,
            email,
            first_name,
            last_name,
            phone,
            role;
    `;
    
    result = await pool.query(
        query,
        [refreshToken,result.rows[0].id]
    );

    if(result.rowCount === 0){
        throw new ApiError(
            400,
            "Failed to login, please try again"
        );
    }

    setAuthCookies(
        res,
        accessToken,
        refreshToken
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    user: result.rows[0]
                },
                "User logged in successfully"
            )
        );

});

const logOut = asyncHandler (async (req, res) => {
    const user = req.user;
    const technician = req.technician || null;

    const client = await pool.connect();

    try{
        await client.query("BEGIN");

        const query = `
            UPDATE users
            SET refresh_token = NULL
            WHERE id = $1;
        `;

        await client.query(query,[user.id]);

        if(technician){
            const query = `
                UPDATE technicians
                SET status = 'offline',
                    last_seen_at = NOW()
                WHERE id = $1;
            `;

            await client.query(query,[technician.id]);
        }

        await client.query("COMMIT");

    }catch(err){
        try{
            await client.query("ROLLBACK");
        }catch(_) {}

        throw new ApiError(
            500,
            "Error while logging out"
        );

    }finally{
        client.release();
    }
    
    clearAuthCookies(res);

    await invalidateCaches(user.id, technician?.id);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Logged out successfully"
            )
        );
});

const refreshAccessToken = asyncHandler (async (req, res) => {
    const incomingRefreshToken = 
        req?.cookies?.refreshToken || req?.body?.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(
            401,
            "Unauthorized request"
        );
    }

    try{
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        
        let query = `
            SELECT
                id, 
                username,
                email,
                first_name,
                last_name,
                phone,
                role
            FROM users
            WHERE id = $1
                AND refresh_token = $2
                AND deleted_at IS NULL
                AND deactivated_at IS NULL
            LIMIT 1;
        `;

        const values = [
            decodedToken.id,
            incomingRefreshToken
        ];

        const result = await pool.query(query,values);

        const user = result.rows[0];

        if(!user){
            throw new ApiError(
                401,
                "Refresh token is expired or used"
            );
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        query = `
            UPDATE users
            SET refresh_token = $1
            WHERE id = $2;
        `;

        await pool.query(query,[refreshToken, user.id]);
        
        return res
            .status(200)
            .cookie("accessToken",accessToken,getAccessCookieOptions())
            .cookie("refreshToken",refreshToken,getRefreshCookieOptions())
            .json(
                new ApiResponse(
                    200,
                    {
                        user: user
                    },
                    "Access token refreshed successfully"
                )
            );

    }catch(err){
        throw new ApiError(
            401,
            err?.message || "invalid refresh token"
        );
    }
});


export {
    register,
    logIn,
    logOut,
    refreshAccessToken
};