import pool from '#config/db.js';
import { deleteFromCloudinary } from '#shared';


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

    let queueResults = await Promise.allSettled(
        imageFiles.map( (file) =>
            cloudinaryQueue.add(
                "image:delete",
                {
                    public_id: file.public_id,
                    resourceType: file.media_type
                },
                {
                    jobId: `image:delete:${file.public_id}`
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