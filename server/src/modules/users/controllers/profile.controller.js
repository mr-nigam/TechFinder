import pool from '#config/db';
import asyncHandler from '#utils/asyncHandler';
import ApiError from '#utils/apiError';
import ApiResponse from '#utils/apiResponse';

import formatMyProfile from '#utils/user.util';
import cloudinaryQueue from '#utils/cloudinary.jobs';
import removeLocalFile from '#shared/utils/file';

import { 
    getCache,
    setCache,
    deleteCache,
} from '#lib/cache';

const USER_PROFILE_FIELDS = `
    id,
    username,
    email,
    first_name,
    last_name,
    primary_phone_number,
    country_code,
    is_primary_phone_number_verified,
    gender,
    profile_picture_url,
    bio,
    is_email_verified,
    role,
    status,
    total_bookings,
    total_money_spend,
    total_money_save
`;

const getProfile = asyncHandler(async (req, res) => {
    const user = req.user;

    const cacheKey = `profile:user:${user.id}`;
    
    let myProfile;

    myProfile = await getCache(cacheKey);
    
    if(!myProfile){
        const query = `
            SELECT
                ${USER_PROFILE_FIELDS}
            FROM users
            WHERE id = $1;
        `;

        const result = await pool.query(query, [user.id]);
        const user = result.rows[0];
        
        if(!user){
            throw new ApiError(
                404, 
                "User not found"
            );
        }

        myProfile = formatMyProfile(user);

        await setCache(cacheKey,myProfile,600);
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                myProfile,
                "User profile fetched successfully"
            )
        );
});

const updateProfile = asyncHandler(async (req, res) => {
    const user = req.user;

    try{
        const {
            first_name = "",
            last_name = "",
            bio = "",
            gender = "",
            date_of_birth = null
        } = req.body;

        const normalized = {
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            bio: bio?.trim() ?? null,
            gender: gender?.trim() || "not shared",
            date_of_birth: date_of_birth || null
        };

        if(
            !normalized.first_name || 
            !normalized.last_name
        ) {
            throw new ApiError(
                400,
                "First name and last name are required"
            );
        }

        const query = `
            UPDATE users
            SET first_name = $1,
                last_name = $2,
                bio = $3,
                gender = $4,
                date_of_birth = $5
            WHERE id = $6;
            RETURNING ${USER_PROFILE_FIELDS};
        `;

        const values = [
            normalized.first_name, 
            normalized.last_name,
            normalized.bio,
            normalized.gender,
            normalized.date_of_birth,
            user.id
        ];

        const result = await pool.query(query,values);
        const updatedUser = result.rows[0];

        if(!updatedUser){
            throw new ApiError(
                404,
                "User not found or not updated"
            );
        }

        const myProfile = formatUserProfile(updatedUser);
        const cacheKey = `profile:user:${user.id}`;
        
        try{
            await deleteCache(cacheKey);
            await setCache(cacheKey,myProfile,600);
        }catch(err){
            console.error("Redis Deletion failed:", err.message);
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    myProfile,
                    "User data updated successfully"
                )
            );
            
    }catch(err){

        throw new ApiError(
            err.statusCode || 500,
            err.message || "Failed to update user data"
        );
    }
});

const updateProfilePicture = asyncHandler(async (req, res) => {
    const user = req.user;

    if(!req.file?.path){
        throw new ApiError(
            400,
            "Profile picture file is required"
        );
    }

    const localPath = req?.file?.path || "";

    const uploaded = localPath
        ? await uploadOnCloudinary(localPath)
        : null;

    if(!uploaded){
        throw new ApiError(
            500,
            "Failed to upload profile picture"
        );
    }

    let query = `
        SELECT profile_picture_public_id
        FROM users
        WHERE id = $1;
    `;
    let result = await pool.query(query,[user.id]);
    const oldPublicId = result.rows[0].profile_picture_public_id;
    if(result.rowCount === 0){
        throw new ApiError(
            404,
            "Invalid credentials"
        )
    }
    
    query = `
        UPDATE users
        SET profile_picture_public_id = $1,
            profile_picture_url = $2
            updated_at = NOW()
        WHERE id = $3
        RETURNING ${USER_PROFILE_FIELDS};
    `;

    let values = [
        uploaded.public_id,
        uploaded.secure_url,
        user.id
    ];

    await pool.query(query,values);

    const cacheKey = `profile:user:${user.id}`;
    
    if(oldPublicId){
        try{
            await deleteCache(cacheKey);
            await cloudinaryQueue.add(
                "delete-from-cloudinary",
                {
                    public_id: oldPublicId,
                    resourceType: "image"
                },
                {
                    jobId: `delete:image:${oldPublicId}`
                }
            );
        }catch(err){
            console.error("Queue error:", err.message);
        }
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {publicUrl: uploaded.secure_url},
                "Profile picture updated successfully"
            )
        );
});


export{
    getProfile,
    updateProfile,
    updateProfilePicture,
}