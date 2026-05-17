import pool from 
'#config/database/postgres.js';

import {
    multipleDeleteFromCloudinary
} from '#services';


const deleteAddress = async (addressId) => {
    let query = `
        DELETE FROM addresses
        WHERE id = $1
            AND deleted_at IS NOT NULL;
    `;

    let result = await pool.query(
        query,
        [addressId]
    );

    if(result.rowCount === 0){
        throw new Error(
            "Failed to delete address"
        );
    }

    query = `
        DELETE FROM address_assets
        WHERE address_id = $1
        RETURNING
            public_id,
            media_type;
    `;

    result = await pool.query(
        query,
        [addressId]
    );

    if(result.rowCount === 0){
        throw new Error(
            "Failed to delete address assets"
        );
    }

    const imageFiles = result.rows;

    await multipleDeleteFromCloudinary(imageFiles);
};


export default deleteAddress;