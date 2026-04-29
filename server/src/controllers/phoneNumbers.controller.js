import pool from '../db/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';

import { stat } from 'node:fs';

// Utility Functions
import {
    hasEmpty,
    isValidUUID
} from '../utils/validation.utils.js';

import {
    formatPhoneNumbers
} from '../utils/phoneNumbers.utils.js';


const addPhoneNumber = asyncHandler(async (req, res) => {
    const client = await pool.connect();

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
        
        phoneNumbertemp = normalized.phone_number;

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

        const phoneNumber = result.rows[0];

        if(!phoneNumber){
            throw new ApiError(
                400,
                "Phone Number addition failed"
            );
        }
        
        await client.query("COMMIT");

        return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                {
                    phoneNumber: 
                    formatPhoneNumbers(phoneNumber)
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
            AND is_deleted = false
        ORDER BY is_default DESC, created_at ASC;
    `;
    
    const result = await pool.query(
        query,
        [req.user.id]
    );


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

const getPhoneNumberById = asyncHandler(async (req, res) => {
    const phoneNumberId = req.params.phoneNumberId;
    
    if(!isValidUUID(phoneNumberId)){
        throw new ApiError(
            404,
            "INvalid phone number id"
        );
    }
});

const deletePhoneNumber = asyncHandler(async (req, res) => {
    const phoneNumberId = req.params.phoneNumberId;
    
    if(!isValidUUID(phoneNumberId)){
        throw new ApiError(
            404,
            "INvalid phone number id"
        );
    }

    // add one more endpoint, if this is default number that 
    // set new default update that then come here
    //  either we can ask it do it by own

    const query = `
        UPDATE phone_numbers
        SET is_deleted = true
        WHERE id = $1
            AND user_id = $2
            AND is_deleted = false;
    `;

    const result = await pool.query(
        query,
        [phoneNumberId,req.user.id]
    );

    if(result.rowCount === 0){
        throw new ApiError(
            400,
            "Phone number not found"
        );
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

const changeDefaultPhoneNumber = asyncHandler(async (req, res) => {
    const phoneNumberId = req.params.phoneNumberId;
    
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
                AND is_deleted = false
            RETURNING *;
        `;

        let result = await pool.query(
            query,
            [phoneNumberId, req.user.id]
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
                primary_contact_number = $1,
                country_code = $2,
                is_primary_contact_number_verified = $3,
            WHERE id = $4
                AND is_deleted = false
                AND is_deactivated = false; 
        `;

        let values = [
            newDefaultNumber.phone_number,
            newDefaultNumber.country_code,
            newDefaultNumber.is_verified,
            req.user.id
        ];

        result = await pool.query(
            query,
            values
        );

        if(result.rowCount === 0){
            throw new ApiError(
                404,
                "Setting default phone number failed"
            );
        }

        await client.query("COMMIT");

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                newDefaultNumber.phone_number,
                "This is Default Address from now"
            )
        )

    }catch(err){

        await client.query("ROLLBACK");
        
        throw new ApiError(
            401,
            err.message || "Setting default phone number failed"
        );

    }finally{
        await client.release();
    }
});

const verifyPhoneNumber = asyncHandler(async (req, res) => {});

export {
    addPhoneNumber,
    getMyPhoneNumbers,
    getPhoneNumberById,
    deletePhoneNumber,
    changeDefaultPhoneNumber,
    verifyPhoneNumber
};