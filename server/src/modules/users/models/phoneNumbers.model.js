import pool from '#config/db';


const createPhoneNumbersTable = async() => {
    try{
        await pool.query(`
            CREATE TABLE IF NOT EXISTS phone_numbers(
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                user_id UUID NOT NULL 
                    REFERENCES users(id) ON DELETE CASCADE,

                country_code VARCHAR(5) NOT NULL,
                phone_number VARCHAR(20) NOT NULL
                    CHECK (
                        phone_number ~ '^\+?[0-9]+$'
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
                is_verified BOOLEAN DEFAULT FALSE,
                verified_at TIMESTAMPTZ,

                deleted_at TIMESTAMPTZ,
            
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

                UNIQUE(user_id, phone_number)
            );    
        `);
        
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_phone_numbers_active
            ON phone_numbers(user_id)
            WHERE deleted_at IS NULL;
        `);
        await pool.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_one_default_phone
            ON phone_numbers(user_id)
            WHERE is_default = TRUE AND deleted_at IS NULL;
        `);

        console.log("Phone Numbers table and indexes created successfully");

    }catch(err){

        console.error("Phone Numbers Table creation failed", err);
    }
};


export default createPhoneNumbersTable;