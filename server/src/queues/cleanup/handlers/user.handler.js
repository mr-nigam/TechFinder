import pool from 
'#config/database/postgres.js';

import {
    cleanupQueue,
    emailQueue
} from '#queues';

import {
    multipleDeleteFromCloudinary
} from '#services';


const deleteUser = async (userId) => {

    let imageFiles = [];
    let documentFiles = [];
    let deletedUser = null;

    const client = await pool.connect();

    try{
        await client.query("BEGIN");

        let query = `
            SELECT aa.public_id, 
                aa.media_type
            FROM address_assets AS aa
            JOIN addresses AS a
            ON a.id = aa.address_id
            WHERE a.user_id = $1;    
        `;
        
        let result = await client.query(query, [userId]);
        
        imageFiles = result.rows;

        query = `
            SELECT td.public_id 
            FROM technician_documents AS td
            JOIN technicians AS t
            ON t.id = td.technician_id
            WHERE t.user_id = $1;   
        `;
        
        result = await client.query(query, [userId]);
        
        documentFiles = result.rows;

        query = `
            DELETE FROM users
            WHERE id = $1
            RETURNING
                first_name,
                last_name,
                email;
        `;

        result = await client.query(query, [userId]);
        
        if(result.rowCount === 0){
            throw new Error(
                "Failed to delete user"
            )
        }

        deletedUser = result.rows[0];

        await client.query("COMMIT");

    }catch(err){

        try{
            await client.query("ROLLBACK");
        }catch(_) {}

        console.error(err);

        throw new Error(
            err.message || 
            "Failed to delete user and its associated data"
        );
    }finally{
        client.release();
    }

    await multipleDeleteFromCloudinary([
        ...documentFiles,
        ...imageFiles
    ]);

    try{
        await emailQueue.add(
            "permanent:user:delete",
            {
                first_name: deletedUser.first_name,
                last_name: deletedUser.last_name,
                email: deletedUser.email
            },
            {
                jobId: `permanent:user:delete:${userId}`
            }
        );

        console.log("Permanent user deletion email queued");
    }catch(err){

        console.error(err);
    }
};


export default deleteUser;