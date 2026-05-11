import pool from '#config/db.js';

import {
    cloudinaryQueue,
    emailQueue
} from '#queues';


const deleteTechnician = async (technicianId) => {
    let documentFiles = [];
    let userId = null;

    const client = await pool.connect();

    try{
        await client.query("BEGIN");

        let query = `
            SELECT
                public_id
            FROM technician_documents
            WHERE technician_id = $1
                AND deleted_at IS NULL;
        `;
        
        let result = await client.query(
            query, 
            [technicianId]
        );
        
        documentFiles = result.rows;

        query = `
            DELETE FROM technicians
            WHERE id = $1
            RETURNING
                user_id;
        `;

        result = await client.query(
            query, 
            [technicianId]
        );
        
        if(result.rowCount === 0){
            throw new Error(
                "Failed to delete technician"
            )
        }

        userId = result.rows[0].user_id;

        await client.query("COMMIT");

    }catch(err){

        try{
            await client.query("ROLLBACK");
        }catch(_) {}

        console.error(err);

        throw new Error(
            err.message || 
            "Failed to delete technician and its associated data"
        );

    }finally{
        client.release();
    }

    const queueResults = await Promise.allSettled(
        documentFiles.map( (file) =>
            cloudinaryQueue.add(
                "document:delete",
                {
                    public_id: file.public_id,
                    resourceType: "raw"
                },
                {
                    jobId: `document:delete:${file.public_id}`
                }
            )
        )
    );

    queueResults.forEach((result) => {
        if(result.status === "rejected"){
            console.error(result.reason);
        }
    });

    try{
        await emailQueue.add(
            "permanent:technician:delete",
            {   
                userId: userId
            },
            {
                jobId: `permanent:technician:delete:${technicianId}`
            }
        );

        console.log("Permanent technician deletion email queued");
    }catch(err){

        console.error(err);
    }
};


export default deleteTechnician;