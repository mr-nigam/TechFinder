import pool from '#config/db';


const createPhonesTable = async() => {
    try{
        await pool.query(`
            CREATE TABLE IF NOT EXISTS phones(
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                user_id UUID NOT NULL 
                    REFERENCES users(id) ON DELETE CASCADE,

                -- E.164 Format
                phone VARCHAR(15) NOT NULL
                    CHECK (
                        phone ~ '^\\+[1-9][0-9]{6,14}$'
                    ),

                phone_type text NOT NULL 
                    DEFAULT 'alternate'
                    CHECK (
                        phone_type IN (
                            'family',
                            'whatsapp',
                            'emergency',
                            'alternate'
                        )
                    ),

                verified_at TIMESTAMPTZ,
                deleted_at TIMESTAMPTZ,
            
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

                UNIQUE(user_id, phone)
            );    
        `);
        
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_phones_active
            ON phones(user_id)
            WHERE deleted_at IS NULL;
        `);

        console.log("Phones table and indexes created successfully");

    }catch(err){

        console.error("Phones Table creation failed", err);
    }
};


export default createPhonesTable;