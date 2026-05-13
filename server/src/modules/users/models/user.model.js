import pool from 
'#config/database/postgres.js';

import createUpdatedAtTrigger from '#shared';


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

                -- E.164 Format
                phone VARCHAR(15) UNIQUE NOT NULL
                    CHECK (
                        phone ~ '^\\+[1-9][0-9]{6,14}$'
                    ),

                is_phone_verified BOOLEAN DEFAULT FALSE,
                is_email_verified BOOLEAN DEFAULT FALSE,

                gender VARCHAR(20) DEFAULT 'not shared'
                    CHECK (gender IN (
                        'male',
                        'female',
                        'other',
                        'not_shared'
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
            CREATE INDEX IF NOT EXISTS idx_users_phone
            ON users(phone);
        `);
        
        await createUpdatedAtTrigger('users');
        
        console.log("User table and indexes created successfully");
    }catch(err){

        console.error(" Used Table creation failed", err);
    }
};


export default createUsersTable;