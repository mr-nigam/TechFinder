import { Worker } from 'bullmq';
import redisConnection from '#config/redis';
import pool from '#config/db';
import ApiError from '#utils/apiError';
import { deleteFromCloudinary } from '#utils/cloudinary.util';


new Worker(
    "accountDeletionQueue",deleteAccountJob,{
        connection: redisConnection,
        concurrency: 5,
    }
);


const deleteAccountJob = async(job)=>{
    console.log("📦 Processing Job:", job.name);
    const client = await pool.connect();

    const userId = job.data.userId;
    let cloudinary_delete_ids = [];

    try{
        await client.query("BEGIN");

        let query = `
            SELECT
                profile_picture_publicid
            FROM users
            WHERE id = $1;
        `;

        let result = await client.query(query,[userId]);
        const user = result.rows[0];

        if(!user){
            throw new ApiError(
                400,
                "User not found"
            );
        }
        
        if(user.profile_picture_publicid){
            cloudinary_delete_ids.push(user.profile_picture_publicid);
        }
            
        query = `
            SELECT
                public_id
            FROM address_assets AS aa
            JOIN addresses a ON a.id = aa.address_id
            WHERE a.user = $1;
        `;
            
        result = await client.query(query,[userId]);
            
        result.rows.forEach((row) => {
            if (row.public_id) {
                cloudinary_delete_ids.push(row.public_id);
            }
        });

        await client.query(
            `UPDATE bookings SET user_id = NULL WHERE user_id = $1;
             UPDATE reviews SET user_id = NULL WHERE user_id = $1;
             UPDATE feedback SET user_id = NULL WHERE user_id = $1;`,
            [userId]
        );

        // Delete User
        query = `
            DELETE FROM users
            WHERE id = $1;
        `;

        await client.query(query,[userId]);

        await client.query("COMMIT");

        const results = await Promise.allSettled(
            cloudinary_delete_ids.map((id) => deleteFromCloudinary(id))
        );

        results.forEach((result, index) => {
            if (result.status === "rejected") {
                console.error(
                `Failed deleting ${cloudinary_delete_ids[index]}`
                );
            }
        });

        console.log("Account deleted successfully");
    }catch(err){

        await client.query("ROLLBACK");
        console.error("Delete Failed:", err);

    }finally{
        client.release();
    }
};