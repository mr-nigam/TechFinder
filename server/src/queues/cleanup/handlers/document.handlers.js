import pool from '#config/db.js';
import cloudinaryQueue from '#queues/cloudinary/cloudinary.queue.js';


const deleteDocument = async (documentId) =>{
    const query = `
        DELETE FROM technician_documents
        WHERE id = $1
        RETURNING public_id;
    `;

    const result = await pool.query(
        query,
        [documentId]
    );

    if(result.rowCount === 0){
        throw new Error(
            "Failed to delete document"
        );
    }

    const public_id = result.rows[0].public_id;
    
    try{
        await cloudinaryQueue.add(
            "document:delete",
            {
                public_id: public_id,
                resourceType: "raw"
            },
            {
                jobId: `document:delete:${public_id}`
            }
        )

    }catch(_){ }
};


export default  deleteDocument;