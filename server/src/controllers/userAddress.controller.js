import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import pool from '../db/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';

import { stat } from 'node:fs';

import { 
    uploadOnCloudinary,
    deleteFromCloudinary,
    removeLocalFile 
} from '../utils/cloudinary.js';

import { hashPassword } from '../utils/user.utils.js';

import {
    hasEmpty,
    isValidUUID
} from '../utils/validation.utils.js';

import {
    formatOwnAddress,
    formatAddressAssets
} from '../utils/address.utils.js';


const addAddress = asyncHandler(async (req, res) => {
    try{
        const {
            address_line_1 = "",
            address_line_2 = "",
            landmark = "",
            city = "",
            state = "",
            country = "",
            pincode = "",
            is_default = "",
            lat,
            lng,
            location_source = "",
            accuracy = null,
        } = req.body;

        const normalized = {
            address_line_1: address_line_1.trim(),
            address_line_2: address_line_2?.trim() || "",
            landmark: landmark?.trim() || "",
            city: city.trim(),
            state: state.trim(),
            country: country.trim(),
            pincode: pincode.trim(),
            location_source: location_source.trim()
        };
        
        const requiredFields = [
            normalized.address_line_1,
            normalized.city,
            normalized.state,
            normalized.country,
            normalized.pincode,
            lat,
            lng
        ];

        // validate given fields
        if(hasEmpty(requiredFields)){
            throw new ApiError(
                400,
                "All required fields are not given"
            );
        }

        // remove previes default if is_defaul is true
        if(is_default){
            const query = `
                UPDATE addresses
                SET is_default = false
                WHERE user_id = $1
                    AND is_default = true;
            `;
            await pool.query(
                query,
                [req.user.id]
            );
        }

        const query = `
            INSERT INTO addresses (
                user_id,
                address_line_1,
                address_line_2,
                landmark,
                city,
                state,
                country,
                pincode,
                location,
                location_accuracy_meters,
                location_source,
                is_default
            )
            values(
                $1, $2, $3, $4,
                $5, $6, $7, $8,

                ST_SetSRID(
                    ST_MakePoint($9, $10),
                    4326
                )::GEOGRAPHY,
                
                $11, $12, $13
            )
            RETURNING *;
        `;

        const values = [
            req.user.id,
            normalized.address_line_1,
            normalized.address_line_2,
            normalized.landmark,
            normalized.city,
            normalized.state,
            normalized.country,
            normalized.pincode,
            lng,
            lat,
            accuracy,
            normalized.location_source,
            is_default
        ];

        const result = await pool.query(
            query,
            values
        );

        const address = result.rows[0];

        return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                { address: formatAddress(address) },
                "Address created successfully"
            )
        );

    }catch(err){
       
        throw new ApiError(
            400,
            err.message ||
            "Failed to add address"
        );
    }
});

const addAddressesAssests = asyncHandler(async (req, res) => {});

const getAddressById = asyncHandler(async (req, res) => {
    const addressId = req.params?.id;

    if(!isValidUUID(addressId)){
        throw new ApiError(
            400,
            "Invalid address id"
        );
    }

    let query = `
        SELECT *
        FROM addresses
        WHERE id = $1
            AND user_id = $2
            AND is_deleted = false
        LIMIT 1;
    `;

    let result = await pool.query(
        query,
        [addressId,req.user.id]
    );
    
    const address = result.rows[0];

     if(!address){
        throw new ApiError(
            404,
            "Address not available"
        );
    }

    query = `
        SELECT 
            id,
            asset_type,
            asset_url, 
            duration
        FROM address_assets
        WHERE address_id = $1
            AND is_deleted = false;
    `;

    result = await pool.query(
        query,
        [addressId]
    );

    const assets = result.rows;

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                address: formatOwnAddress(address),
                assets:  formatAddressAssets(assets)
            },
            "Address fetched successfully"
        )
    );

});

// use pagination
const getMyAddresses = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const query = `
        SELECT
            id,
            address_line_1,
            city,
            pincode,
            is_default
        WHERE user_id = $1
            AND is_deleted = false
        ORDER BY is_default DESC, created_at ASC; 
    `;
    const result = await pool.query(query,[userId]);

    const addresses = result.rows;

    if(result.rowCount === 0){
        throw new ApiError(
            404,
            " no addresses found"
        );
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            addresses,
            "All Addresses fetched successfully"
        )
    )

});

const getAddressesAssests = asyncHandler(async (req, res) => { });

const updateAddress = asyncHandler(async (req, res) => {
    const addressId = req.params.addressId;

    if(!isValidUUID(addressId)){
        throw new ApiError(
            400,
            "Invalid address id"
        );
    }

    try{
        const {
            address_line_1 = "",
            address_line_2 = "",
            landmark = "",
            city = "",
            state = "",
            country = "",
            pincode = "",
        } = req.body;

        const normalized = {
            address_line_1: address_line_1.trim(),
            address_line_2: address_line_2.trim() || "",
            landmark: landmark?.trim() || "",
            city: city.trim(),
            state: state.trim(),
            country: country.trim(),
            pincode: pincode.trim(),
        };

        const requiredFields = [
            normalized.address_line_1,
            normalized.city,
            normalized.state,
            normalized.country,
            normalized.pincode
        ];

        if(hasEmpty(requiredFields)){
            throw new ApiError(
                400,
                "All required fields are not given"
            );
        }

        const query = `
            UPDATE addresses
            SET 
                address_line_1 = $1,
                address_line_2 = $2,
                landmark = $3
                city = $4,
                state = $5,
                country = $6,
                pincode = $7
            WHERE id = $8
                AND user_id = $9
                AND is_deleted = false
            RETURNING*; 
        `;

        const values = [
            normalized.address_line_1,
            normalized.address_line_2,
            normalized.landmark,
            normalized.city,
            normalized.state,
            normalized.country,
            normalized.pincode,
            addressId,
            req.user.id
        ];

        const result = await pool.query(
            query,
            values
        );

        const address = result.rows[0];
        if(!address){
            throw new ApiError(
                400,
                "Address updation failed"
            );
        }

        return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                {address: formatOwnAddress(address)},
                "Address updated successfully"
            )
        );

    }catch(err){

        throw new ApiError(
            400,
            err.message || "Address updation failed"
        );
    }
});

const updateAddressLocation = asyncHandler(async (req, res) => {
    const {
        lat,
        lng,
        location_accuracy_meters,
        location_source = "",
    } = req.body;

    

});

const updateAddressAssests = asyncHandler(async (req, res) => {});

//learn redis
const deleteAddress = asyncHandler(async (req, res) => {
    const addressId = req.params?.id;

    if(!isValidUUID(addressId)){
        throw new ApiError(
            400,
            "Invalid address id"
        );
    }

    const client = await pool.connect();

    try{
        await client.query('BEGIN');

        const result = await client.query(`
            UPDATE addresses
            SET is_deleted = true,
                deleted_at = NOW()
            WHERE id = $1
                AND user_id = $2
                AND is_deleted = false
            RETURNING id;
        `,[addressId, req.user.id]);
        
        if(result.rowCount === 0){
            throw new ApiError(
                404,
                "Invalid data"
            );
        }

        await client.query(`
            UPDATE address_assets
            SET is_deleted = true,
                deleted_at = NOW()
            WHERE address_id = $1
                AND is_deleted = false
            RETURNING id;
        `,[addressId]);


        await client.query('COMMIT');

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Address deleted successfully"
            )
        );

    }catch(err){
        await client.query('ROLLBACK');

        return res
        .status(500)
        .json(
            new ApiError(
                500,
                err.message || "Address deletion failed"
            )
        );

    }finally{
        client.release();
    }

});

const changeDefaultAddress = asyncHandler(async (req, res) => {
    const addressId = req.params?.addressId;
    const userId = req.user.id;

    if(!isValidUUID(addressId)){
        throw new ApiError(
            400, 
            "Invalid address id"
        );
    }

    let query = `
        UPDATE addresses
        SET is_default = CASE
            WHEN id = $1 THEN true
            ELSE false
        END
        WHERE user_id = $2
            AND is_deleted = false
        RETURNING id;
    `;

    let result = await pool.query(query,[addressId, userId]);

    if(result.rowCount === 0){
        throw new ApiError(
            404,
            "Setting default address failed"
        );
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "This is Default Address from now"
        )
    )
});


export {
    addAddress,
    addAddressesAssests,
    getMyAddresses,
    getAddressById,
    getAddressesAssests,
    updateAddress,
    updateAddressAssests,
    deleteAddress,
    changeDefaultAddress,
}