import pool from 
'#config/database/postgres.js';

import cleanupQueue from '../cleanup.queue';

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

    let imageFiles = result.rows;

    // do it at this point only
    let queueResults = await Promise.allSettled(
        imageFiles.map( (file) =>
            cleanupQueue.add(
                "cloudinary:file:delete",
                {
                    public_id: file.public_id,
                    resourceType: file.media_type
                },
                {
                    jobId: `cloudinary:file:delete:${file.public_id}`
                }
            )
        )
    );

    queueResults.forEach((result) => {
        if(result.status === "rejected"){
            console.error(result.reason);
        }
    });
};


export default deleteAddress;