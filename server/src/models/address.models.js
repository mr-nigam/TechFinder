import pool from '../db/db.js';


const createAddressesTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS addresses (
                -- Keys
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                
                user_id UUID NOT NULL 
                    REFERENCES users(id) ON DELETE CASCADE,

                -- Address 
                address_line_1 TEXT NOT NULL,
                address_line_2 TEXT,
                landmark TEXT,

                -- Region
                city TEXT NOT NULL,
                state TEXT NOT NULL,
                country TEXT NOT NULL,
                pincode VARCHAR(20) NOT NULL,

                -- Geo
                location GEOGRAPHY(POINT, 4326),
                
                -- Flags
                is_default BOOLEAN DEFAULT FALSE,

                -- Deleteion Status
                is_deleted BOOLEAN DEFAULT FALSE,

                -- Audit
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP

            );
        `);

        // Indexing
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_addresses_user_id 
            ON addresses(user_id);
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_addresses_location
            ON addresses USING GIST(location);
        `);
        
        await pool.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_one_default_address
            ON addresses(user_id)
            WHERE is_default = TRUE;
        `);

        console.log("Addresses table and indexes created successfully");

    }catch(err){
        console.error("Addresses Table creation failed", err);
    }
};


export default createAddressesTable;