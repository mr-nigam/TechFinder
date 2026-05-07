import pool from '#config/db';
import createUpdatedAtTrigger from '#shared/utils/dbTriggers.util';


const createAddressesAssetsTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS address_assets(
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                
                address_id  UUID NOT NULL 
                    REFERENCES addresses(id) ON DELETE CASCADE,

                asset_type VARCHAR(20) NOT NULL
                    CHECK (asset_type IN (
                        'entrance_photo',
                        'building_photo',
                        'parking_photo',
                        'videos',
                        'others'
                    )),
        
                public_id TEXT UNIQUE NOT NULL,
                asset_url TEXT NOT NULL
                    CHECK (asset_url ~ '^https?://'),

                size_bytes INT NOT NULL,
                duration NUMERIC(8,2)
                    CHECK (
                        (asset_type = 'videos' AND duration IS NOT NULL)
                        OR (asset_type != 'videos')
                    ),

                sort_order INT DEFAULT 1
                    CHECK (sort_order >= 1),

                deleted_at TIMESTAMPTZ,
                
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_addresses_address_id 
            ON address_assets(address_id)
            WHERE deleted_at IS NULL;
        `);
        
        await createUpdatedAtTrigger('address_assets');

        console.log("Addresses assests table and indexes created successfully");

    }catch(err){
        console.error("Addresses assests table creation failed", err);
    }
};


export default createAddressesAssetsTable;