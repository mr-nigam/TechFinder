import pool from '#config/db';
import ApiError from '#shared/utils/apiError';
import ApiResponse from '#shared/utils/apiResponse';
import asyncHandler from '#shared/utils/asyncHandler';


import {
    hasEmpty,
    isValidUUID
} from '#shared/utils/validation.utils';

import {
    isValidPhoneNumber,
    formatPhoneNumbers
} from '#shared/utils/phoneNumbers.utils';

import {
    phoneNumberQueue,
    emailQueue
} from '../jobs/phoneNumber.queue.js';


const addPhoneNumber = asyncHandler(async (req, res) => {
    const client = await pool.connect();
    const user = req.user;

    try{
        await client.query("BEGIN");

        const {
            phone_number = "",
            country_code = "",
            phone_number_type = "alternate",
            is_default = "",
        } = req.body;

        const normalized = {
            phone_number: phone_number?.trim() || "",
            country_code: country_code?.trim() || "",
            phone_number_type: phone_number_type?.trim() || "alternate",
        };
        
        const requiredFields = [
            normalized.phone_number,
            normalized.country_code,
            normalized.phone_number_type
        ];

        if(hasEmpty(requiredFields)){
            throw new ApiError(
                400,
                "All required fields are not given"
            );
        }
    
        isValidPhoneNumber({
            phone_number: normalized.phone_number,
            country_code: normalized.country_code
        });

        if(is_default){
            const query = `
                UPDATE phone_numbers
                SET is_default = false
                WHERE user_id = $1
                    AND is_default = true
                    AND is_deleted = false;
            `;
            await pool.query(
                query,
                [req.user.id]
            );
        }

        const query = `
            INSERT INTO contacts(
                user_id,
                phone_number,
                country_code,
                phone_number_type,
                is_default
            )
            VALUES(
                $1, $2, $3, $4, $5
            )
            RETURNING *;
        `;

        const values = [
            req.user.id,
            normalized.phone_number,
            normalized.country_code,
            normalized.phone_number_type,
            is_default
        ];

        const result = await pool.query(
            query,
            values
        );

        const ph = result.rows[0];
        
        if(!phoneNumber){
            throw new ApiError(
                400,
                "Phone Number addition failed"
            );
        }
        
        await client.query("COMMIT");

        try{
            await emailQueue.add(
                "phone-number-added", 
                { 
                    userId: user.id,
                    phoneNumberId: ph.id
                },
                {
                    jobId: `email:phone-number-added:${ph.id}`
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
                    {
                        phoneNumber: 
                        formatPhoneNumbers(ph)
                    },
                    "Phone Number added successfully"
                )
            );

    }catch(err){

        await client.query("ROLLBACK");

        if(err.code === "23505"){
            throw new ApiError(
                409,
                "Phone number already exists"
            );
        }
        
        throw new ApiError(
            401,
            "Phone Number addition failed"
        );

    }finally{
        await client.release();
    }
});

const getMyPhoneNumbers = asyncHandler(async (req, res) => {
    const user = req.user;
    const query = `
        SELECT 
            id,
            country_code,
            phone_number,
            phone_number_type,
            is_default,
            is_verified
        FROM phone_numbers
        WHERE user_id = $1
            AND deleted_at IS NULL
        ORDER BY is_default DESC, created_at ASC;
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

const deletePhoneNumber = asyncHandler(async (req, res) => {
    const phoneNumberId = req.params.phoneNumberId;
    const user = req.user;

    if(!isValidUUID(phoneNumberId)){
        throw new ApiError(
            404,
            "Invalid phone number id"
        );
    }

    // add one more endpoint, if this is default number that 
    // set new default update that then come here
    // either we can ask it do it by own

    const query = `
        UPDATE phone_numbers
        SET deleted_at = NOW()
        WHERE id = $1
            AND user_id = $2
            AND deleted_at IS NULL;
    `;

    const result = await pool.query(
        query,
        [phoneNumberId, user.id]
    );

    const ph = result.rows[0];
    if(result.rowCount === 0){
        throw new ApiError(
            400,
            "Phone number not found"
        );
    }

    try{
        await phoneNumberQueue.add(
            "delete-phone-number",
            { 
                phoneNumberId: ph.id,
            },
            {
                jobId: `delete:phone-number:${ph.id}`,
                delay: 1 * 24 * 60 * 60 * 1000 // 1 days in milliseconds
            }
        );
    }catch(err){
        console.error("Queue error:", err.message);       
    }

    try{
        await emailQueue.add(
            "deleted-phone-number", 
            { 
                userId: user.id,
                phoneNumberId: ph.id
            },
            { 
                jobId: `email:deleted:phone-number:${ph.id}`
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

const setDefaultPhoneNumber = asyncHandler(async (req, res) => {
    const phoneNumberId = req.params.phoneNumberId;
    const user = req.user;

    if(!isValidUUID(phoneNumberId)){
        throw new ApiError(
            404,
            "INvalid phone number id"
        );
    }

    const client = await pool.connect();

    try{
        await client.query("BEGIN");

        let query = `
            UPDATE phone_numbers
            SET is_default = CASE
                WHEN id = $1 THEN true
                ELSE false
            END
            WHERE user_id = $2
                AND deleted_at IS NULL
            RETURNING *;
        `;

        let result = await pool.query(
            query,
            [phoneNumberId, user.id]
        );

        if(result.rowCount === 0){
            throw new ApiError(
                404,
                "Setting default phone number failed"
            );
        }
        
        let newDefaultNumber = result.rows[0];

        query = `
            UPDATE users
            SET 
                primary_phone_number = $1,
                country_code = $2,
                is_primary_phonet_number_verified = $3,
            WHERE id = $4
                AND deleted_at IS NULL
                AND deactivated_at IS NULL; 
        `;

        let values = [
            newDefaultNumber.phone_number,
            newDefaultNumber.country_code,
            newDefaultNumber.is_verified,
            user.id
        ];

        result = await pool.query(query, [values]);

        if(result.rowCount === 0){
            throw new ApiError(
                404,
                "Setting default phone number failed"
            );
        }

        await client.query("COMMIT");

        try{
            await emailQueue.add(
                "set-default-phone-number", 
                { 
                    userId: user.id,
                    phoneNumberId: newDefaultNumber.id
                },
                { 
                    jobId: `email:set-default-phone-number:${ph.id}`
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
                    newDefaultNumber.phone_number,
                    "This is Default Address from now"
                )
            );

    }catch(err){

        await client.query("ROLLBACK");
        
        throw new ApiError(
            401,
            err.message || "Setting default phone number is failed"
        );

    }finally{
        await client.release();
    }
});

const sendPhoneNumberOtp = asyncHandler(async (req, res) => {});

const resendPhoneNumberOtp = asyncHandler(async (req, res) => {});

const verifyPhoneNumber = asyncHandler(async (req, res) => {});


export {
    addPhoneNumber,
    getMyPhoneNumbers,
    deletePhoneNumber,
    setDefaultPhoneNumber,
    sendPhoneNumberOtp,
    resendPhoneNumberOtp,
    verifyPhoneNumber
};