import pool from '../db/db.js';


const createUsersTable = async()=>{
    try{
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                first_name VARCHAR(25) NOT NULL,
                last_name VARCHAR(25) NOT NULL,
                
                email VARCHAR(100) UNIQUE NOT NULL,
                
                gender VARCHAR(20) DEFAULT 'Not Shared'
                CHECK (gender IN (
                    'male',
                    'female',
                    'other',
                    'not_shared'
                )),
                
                username VARCHAR(25) UNIQUE NOT NULL 
                CHECK (
                    char_length(username) BETWEEN 3 AND 25 
                    AND username !~ '\s'
                ),

                age INT CHECK(age BETWEEN 0 AND 120),

                password TEXT NOT NULL,
                refresh_token TEXT,
                
                profile_picture TEXT,
                bio TEXT,
                
                current_location GEOGRAPHY(POINT, 4326),

                is_email_verified BOOLEAN DEFAULT FALSE,
                last_seen TIMESTAMPTZ,

                role VARCHAR(15) NOT NULL 
                CHECK(role IN('user','technician','admin')) 
                DEFAULT 'user',

                status VARCHAR(15) NOT NULL 
                CHECK(status IN ('active','blocked','suspended')) 
                DEFAULT 'active',
                
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );    
        `);
        
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_users_current_location
            ON users USING GIST(current_location);
        `);

        console.log("Table + indexes created successfully");

    }catch(err){
        
        console.log("Table creation failed", err);
    }
};



export default createUsersTable;