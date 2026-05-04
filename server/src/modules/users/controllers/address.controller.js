import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '#config/db';
import asyncHandler from '#utils/asyncHandler';
import ApiError from '#utils/apiError';
import ApiResponse from '#utils/apiResponse';

import { 
    uploadOnCloudinary,
    deleteFromCloudinary,
    removeLocalFile 
} from '#utils/cloudinary.util';

import hashPassword from '#util/password';

import {
    hasEmpty,
    isValidUUID
} from '#utils/validation.utils';

import {
    formatOwnAddress,
    formatAddressAssets
} from '#utils/address.utils';

import {
    addressQueue,
    emailQueue
} from '../jobs/address.queue.js';


const addAddress = asyncHandler(async (req, res) => {
    const user = req.user;
    const client = await pool.connect();
    try{
        client.query("BEGIN");

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

        // remove previous default if is_defaul is true
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
            user.id,
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

        const result = await pool.query(query, values);

        const address = result.rows[0];
        
        if(!address){
            throw new ApiError(
                400,
                "Unable to add address"
            );
        }
        
        client.query("COMMIT");

        try{
            await emailQueue.add("new-address-added", 
                { userId: user.id,},
                {
                    jobId: `email:address-added:${address.id}`
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
                    { address: formatAddress(address) },
                    "Address created successfully"
                )
            );

    }catch(err){
        await client.query("ROLLBACK");

        throw new ApiError(
            400,
            err.message ||
            "Failed to add address"
        );
    }finally{
        await client.release();
    }
});

const getAddressById = asyncHandler(async (req, res) => {
    const user = req.user;
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
            AND deletedat IS NULL
        LIMIT 1;
    `;

    let result = await pool.query(
        query,
        [addressId,user.id]
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
            AND deleted_at IS NULL;
    `;

    result = await pool.query(query, [addressId]);

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

const getMyAddresses = asyncHandler(async (req, res) => {
    const user = req.user;

    let{ limit, page, sortBy, sortType } = req.query;

    limit = Math.min(parseInt(limit) || 10, 10); // max 50
    page = Math.max(parseInt(page) || 1, 1);
    const offset = (page - 1) * limit;

    const allowedSortFields = ["created_at", "city", "pincode"];
    if(!allowedSortFields.includes(sortBy)){
        sortBy = "created_at";
    }

    sortType = sortType?.toUpperCase() === "DESC" ? "DESC" : "ASC";

    const query = `
        SELECT
            id,
            address_line_1,
            city,
            pincode,
            is_default,
            created_at,
            COUNT(*) OVER() AS total_count
        FROM addresses
        WHERE user_id = $1
            AND deleted_at IS NULL
        ORDER BY is_default DESC, ${sortBy} ${sortType}
        LIMIT $2, OFFSET $3; 
    `;

    const result = await pool.query(query,[user.id]);
    const addresses = result.rows;

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    addresses,
                    pagination:{
                        total_count,
                        page,
                        limit,
                        totalPages: Math.ceil(total_count / limit)
                    }
                },
                "All Addresses fetched successfully"
            )
        );

});

const deleteAddress = asyncHandler(async (req, res) => {
    const user = req.user;
    const addressId = req.params?.id;

    if(!isValidUUID(addressId)){
        throw new ApiError(
            400,
            "Invalid address id"
        );
    }

    const client = await pool.connect();

    try{
        await client.query("BEGIN");

        let query = `
            UPDATE addresses
            SET deleted_at = NOW()
            WHERE id = $1
                AND user_id = $2
                AND deleted_at IS NULL;
        `;

        let result = await client.query(
            query,
            [addressId, user.id]
        );
        
        if(result.rowCount === 0){
            throw new ApiError(
                404,
                "Address not found"
            );
        }
 
        query = `
            UPDATE 
            address_assets
            SET deleted_at = NOW()
            WHERE address_id = $1
                AND deleted_at IS NULL
            RETURNING id, public_id;
        `;

        result = await client.query( query, [addressId]);

        let assets = result.rows;

        await client.query("COMMIT");

         try{
            await addressQueue.add(
                "delete-address",
                { 
                    jobId: `delete:address:${addressId}`,
                    delay: 1 * 24 * 60 * 60 * 1000 // 1 days in milliseconds
                }
            );

            console.log("Address scheduled for deletion.");
        
        }catch(err){
            console.error("Queue error:", err.message);
        }

        try{
            await Promise.all(
                assets.map(ast =>
                    addressQueue.add(
                        "delete-address-asset",
                        {
                            assetId: ast.id,
                            publicId: ast.public_id
                        },
                        {
                            jobId: `delete:asset:${ast.id}`,
                            delay: 1 * 24 * 60 * 60 * 1000 // 1 days in milliseconds
                        }
                    )
                )
            );
            
            console.log("Address assets scheduled for deletion.");
        
        }catch(err){
            console.error("Queue error:", err.message);
        }

        try{
            await emailQueue.add(
                "address-deleted", 
                { userId: user.id, },
                {
                    jobId: `email:address-deleted:${addressId}`
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
                    "Address deleted successfully"
                )
            );

    }catch(err){
        await client.query("ROLLBACK");

        throw new ApiError(
            500,
            err.message || "Address deletion failed"
        );

    }finally{
        await client.release();
    }

});

const changeDefaultAddress = asyncHandler(async (req, res) => {
    const addressId = req.params?.addressId;
    const user = req.user;

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
            AND deleted_at IS NULL
        RETURNING *;
    `;

    let result = await pool.query(query, [addressId, userId]);
    // let address = result.rows[0];

    if(result.rowCount === 0){
        throw new ApiError(
            404,
            "Setting default address failed"
        );
    }

    try{
        await emailQueue.add(
            "address-default", 
            { userId: user.id, },
            {
                jobId: `email:address-default:${addressId}`
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
                "This is Default Address from now"
            )
        );
});

const updateAddress = asyncHandler(async (req, res) => {
    const user = req.user;
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
            user.id
        ];

        const result = await pool.query( query, values );
        const address = result.rows[0];

        if(!address){
            throw new ApiError(
                400,
                "Address updation failed"
            );
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
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

const updateAddressLocation = asyncHandler(async (req, res) => { });

const addAddressesAssests = asyncHandler(async (req, res) => { });

const getAddressesAssests = asyncHandler(async (req, res) => { });

const updateAddressAssests = asyncHandler(async (req, res) => { });


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