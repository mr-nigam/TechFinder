import pool from '#config/db';


const createAddressesAssetsTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS address_assets  (
                -- Keys
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                
                address_id  UUID NOT NULL 
                    REFERENCES addresses(id) ON DELETE CASCADE,

                asset_type VARCHAR(20) NOT NULL
                    CHECK (asset_type IN (
                        'entrance_photo',
                        'building_photo',
                        'parking_photo',
                        'others'
                    )),
        
                public_id TEXT NOT NULL,
                asset_url TEXT NOT NULL,

                size_bytes INT NOT NULL,
                duration NUMBER(8,2),

                sort_order INT DEFAULT 1,

                -- Deleteion Status
                is_deleted BOOLEAN DEFAULT FALSE,

                -- Audit
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMPTZ,
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


export default createAddressesAssetsTable;