import pool from 
'#config/database/postgres.js';

import { 
    createUpdatedAtTrigger 
} from '#shared';


const createConversationsTable = async () => {
    try{

        await pool.query(`
            CREATE TABLE IF NOT EXISTS conversations(

                id UUID PRIMARY KEY
                    DEFAULT gen_random_uuid(),
                
                user_id UUID
                    REFERENCES users(id),

                technician_id UUID
                    REFERENCES technicians(id),

                user_unread_count INT DEFAULT 0,
                technician_unread_count INT DEFAULT 0,

                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            
            );
        `);


        await createUpdatedAtTrigger('bookings');

        console.log("Conversations table and indexes created successfully");
    }catch(err){

        console.error("Conversations Table creation failed", err);
    }
}