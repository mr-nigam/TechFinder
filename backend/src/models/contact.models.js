import pool from '../db/db.js';


const createContactsTable = async() => {
    try{
        await pool.query(`
            CREATE TABLE IF NOT EXISTS contacts(
                -- Keys
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                user_id UUID NOT NULL 
                    REFERENCES users(id) ON DELETE CASCADE,

                -- Contact Details
                country_code VARCHAR(5) NOT NULL,

                contact_number TEXT NOT NULL
                    CHECK (
                        contact_number ~ '^[0-9]+$'
                        AND length(contact_number) BETWEEN 6 AND 15    
                    ),

                contact_type text NOT NULL DEFAULT 'alternate'
                    CHECK (contact_type IN (
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
                UNIQUE(user_id, contact_number)
            );    
        `);
        
        // Indexing
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_contacts_user_id
            ON contacts(user_id);
        `);
        
        await pool.query(`
            CREATE INDEX IF NOT EXISTS ux_one_default_contact
            ON contacts(user_id)
            WHERE is_default = TRUE AND is_deleted = FALSE;
        `);

        console.log("Contact table and indexes created successfully");

    }catch(err){

        console.error("Contact Table creation failed", err);
    }
};


export default createContactsTable;