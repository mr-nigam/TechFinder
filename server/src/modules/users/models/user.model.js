import pool from '#config/db';


const createUsersTable = async() => {
    try{
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
                -- Keys
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                -- Identity
                username VARCHAR(25) UNIQUE NOT NULL 
                    CHECK (
                        char_length(username) BETWEEN 3 AND 25 
                        AND username !~ '\s'
                    ),

                first_name VARCHAR(25) NOT NULL,
                last_name VARCHAR(25) NOT NULL,
                
                email VARCHAR(100) UNIQUE NOT NULL,

                -- Contact Details
                primary_phone_number TEXT UNIQUE NOT NULL
                    CHECK (
                        primary_phone_number ~ '^[0-9]+$'
                        AND length(primary_phone_number) BETWEEN 6 AND 15    
                    ),

                country_code VARCHAR(5) NOT NULL,

                is_primary_phone_number_verified BOOLEAN DEFAULT FALSE,

                -- Profile
                gender VARCHAR(20) DEFAULT 'not shared'
                    CHECK (gender IN (
                        'male',
                        'female',
                        'other',
                        'not shared'
                    )),

                date_of_birth DATE 
                CHECK (
                    date_of_birth <= CURRENT_DATE
                    AND date_of_birth >= CURRENT_DATE - INTERVAL '120 years'
                ),

                profile_picture_publicid TEXT,
                profile_picture_url TEXT,
                bio TEXT,

                -- Auth
                password TEXT NOT NULL,
                password_changed_at TIMESTAMPTZ,
                refresh_token TEXT,

                -- Account Status
                is_email_verified BOOLEAN DEFAULT FALSE,
                email_verified_at TIMESTAMPTZ,
                last_seen TIMESTAMPTZ,

                role VARCHAR(15) NOT NULL 
                    CHECK(role IN('user','technician','admin')) 
                    DEFAULT 'user',

                status VARCHAR(15) NOT NULL 
                    CHECK(
                        status IN (
                            'active',
                            'blocked',
                            'suspended',
                            'pending_delete'
                        )) 
                    DEFAULT 'active',

                -- Soft Delete / Deactivation
                deleted_at TIMESTAMPTZ,
                deactivated_at TIMESTAMPTZ,


                -- Audit
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );    
        `);
        
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_users_current_location
            ON users USING GIST(current_location)
            WHERE deleted_at IS NULL
                AND deactivated_at IS NULL;;
        `);
        
        // put indexing on email, username, number,and trigger on update
        console.log("User table and indexes created successfully");
    }catch(err){

        console.error(" Used Table creation failed", err);
    }
};


export default createUsersTable;