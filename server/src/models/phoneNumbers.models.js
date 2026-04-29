import pool from '../db/db.js';


const createPhoneNumbersTable = async() => {
    try{
        await pool.query(`
            CREATE TABLE IF NOT EXISTS phone_numbers(
                -- Keys
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                user_id UUID NOT NULL 
                    REFERENCES users(id) ON DELETE CASCADE,

                -- Phone Number Details
                country_code VARCHAR(5) NOT NULL,

                phone_number VARCHAR(20) NOT NULL
                    CHECK (
                        phone_number ~ '^[0-9]+$'
                        AND length(phone_number) BETWEEN 6 AND 15    
                    ),

                phone_number_type text NOT NULL DEFAULT 'alternate'
                    CHECK (phone_number_type IN (
                        'default',
                        'family',
                        'whatsapp',
                        'emergency',
                        'alternate'
                    )),

                is_default BOOLEAN DEFAULT FALSE,

                -- Verification
                is_verified BOOLEAN DEFAULT FALSE,
                
                -- Deleteion Status
                is_deleted BOOLEAN DEFAULT FALSE,
                
                -- Audit
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

                -- Constraints
                UNIQUE(user_id, phone_number)
            );    
        `);
        
        // Indexing
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_phone_numbers_user_id
            ON phone_numbers(user_id)
            WHERE is_deleted = false;
        `);

        console.log("Phone Numbers table and indexes created successfully");

    }catch(err){

        console.error("Phone Numbers Table creation failed", err);
    }
};


export default createPhoneNumbersTable;