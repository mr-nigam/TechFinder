import pool from '#config/db';
import ApiError from '#shared/utils/apiError';
import ApiResponse from '#shared/utils/apiResponse';
import asyncHandler from '#shared/utils/asyncHandler';
import isValidPhone from '#shared/utils/phone.util';

import {
    hasEmpty,
    isValidUUID
} from '#shared/utils/validation.utils';


import {
    phoneQueue,
    emailQueue
} from '../jobs/phone.queue.js';


const addPhone = asyncHandler(async (req, res) => {
    const user = req.user;

    let {phone, phone_type} = req.body;

    phone = phone?.trim() || "";
    phone_type = phone_type?.trim() || "alternate";

    if(!phone){
        throw new ApiError(
            400,
            "Phone number is missing"
        );
    }
    
    isValidPhone(phone);

    const allowedPhoneTypes = [
        "family",
        "whatsapp",
        "emergency",
        "alternate",
    ];

    if(!allowedPhoneTypes.includes(phone_type)){
        throw new ApiError(
            400,
            "Invalid phone type"
        );
    }

    let addedPhone;
    try{
        const query = `
            INSERT INTO phones(
                user_id,
                phone,
                phone_type
            )
            VALUES( $1, $2, $3 )
            RETURNING 
                id,
                phone,
                phone_type,
                created_at;
        `;

        const values = [
            user.id,
            phone,
            phone_type,
        ];
        
        const result = await pool.query( query, values);

        addedPhone = result.rows[0];
    }catch(err){
        if(err.code === "23505"){
            throw new ApiError(
                409,
                "Phone number already exists"
            );
        }
        
        throw new ApiError(
            500,
            "Phone Number addition failed"
        );

    }
    
    try{
        await emailQueue.add(
            "phone-added", 
            { 
                userId: user.id,
                phoneId: addedPhone.id
            },
            {
                jobId: `email:phone-added:${addedPhone.id}`
            }
        );
    }catch(err){
        console.error("Queue error:", err.message);
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                { phone: addedPhone },
                "Phone Number added successfully"
            )
        );
});

const getPhones = asyncHandler(async (req, res) => {
    const user = req.user;

    const query = `
        SELECT 
            id,
            phone,
            phone_type,
            created_at
        FROM phones
        WHERE user_id = $1
            AND deleted_at IS NULL
        ORDER BY created_at ASC;
    `;
    
    const result = await pool.query(query, [user.id]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                result.rows,
                "Phone numbers fetched successfully"
            )
        );
});

const deletePhone = asyncHandler(async (req, res) => {
    const phoneId = req.params.phoneId;
    const user = req.user;

    if(!isValidUUID(phoneId)){
        throw new ApiError(
            404,
            "Invalid phone number id"
        );
    }

    const query = `
        UPDATE phones
        SET deleted_at = NOW()
        WHERE id = $1
            AND user_id = $2
            AND deleted_at IS NULL;
    `;

    const result = await pool.query(
        query,
        [phoneId, user.id]
    );

    
    if(result.rowCount === 0){
        throw new ApiError(
            400,
            "Phone number not found"
        );
    }

    try{
        await phoneQueue.add(
            "delete-phone",
            { 
                userId: user.id,
                phoneId: phoneId,
            },
            {
                jobId: `delete:phone:${phoneId}`,
                delay: 1 * 24 * 60 * 60 * 1000
            }
        );
    }catch(err){
        console.error("Queue error:", err.message);       
    }

    try{
        await emailQueue.add(
            "delete-phone", 
            { 
                userId: user.id,
                phoneId: phoneId
            },
            { 
                jobId: `email:deleted:phone:${phoneId}`
            }
        );
    }catch(err){
        console.error("Queue error:", err.message);
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Phone number deleted successfully"
            )
        );

});


export {
    addPhone,
    getPhones,
    deletePhone,
};