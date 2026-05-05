import pool from '#config/db';


const createUsersTable = async() => {
    try{

        await pool.query(`
            CREATE EXTENSION IF NOT EXISTS citext;
        `);

        await pool.query(`
            CREATE EXTENSION IF NOT EXISTS pgcrypto;
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                username VARCHAR(25) UNIQUE NOT NULL 
                    CHECK (
                        char_length(username) BETWEEN 3 AND 25 
                        AND username ~ '^[a-zA-Z0-9_]+$'
                    ),

                first_name VARCHAR(25) NOT NULL,
                last_name VARCHAR(25) NOT NULL,
                
                email VARCHAR(100) UNIQUE NOT NULL
                    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),

                primary_phone_number TEXT UNIQUE NOT NULL
                    CHECK (
                        primary_phone_number ~ '^\+?[0-9]+$'
                        AND length(primary_phone_number) BETWEEN 6 AND 15    
                    ),

                country_code VARCHAR(5) NOT NULL,
                is_primary_phone_number_verified BOOLEAN DEFAULT FALSE,

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

                profile_picture_public_id TEXT,
                profile_picture_url TEXT,
                bio TEXT,

                password TEXT NOT NULL,
                password_changed_at TIMESTAMPTZ,
                refresh_token TEXT,

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

                deleted_at TIMESTAMPTZ,
                deactivated_at TIMESTAMPTZ,

                total_bookings INT DEFAULT 0,
                total_money_spend NUMERIC(12,2) DEFAULT 0,
                total_money_save NUMERIC(12,2) DEFAULT 0,

                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );    
        `);
        
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_users_email
            ON users(email);
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_users_username
            ON users(username);
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_users_primary_phone_number
            ON users(primary_phone_number);
        `);
        
        // put trigger on update
        console.log("User table and indexes created successfully");
    }catch(err){

        console.error(" Used Table creation failed", err);
    }
};


export default createUsersTable;