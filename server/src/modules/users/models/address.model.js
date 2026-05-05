import pool from '#config/db';


const createAddressesTable = async () => {
    try{
        
        await pool.query(`
            CREATE EXTENSION IF NOT EXISTS postgis;
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS addresses (                
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                
                user_id UUID NOT NULL 
                    REFERENCES users(id) ON DELETE CASCADE,
                 
                address_line_1 TEXT NOT NULL,
                address_line_2 TEXT,
                landmark TEXT,
                
                city TEXT NOT NULL,
                state TEXT NOT NULL,
                country TEXT NOT NULL,
                pincode VARCHAR(20) NOT NULL
                    CHECK (length(pincode) BETWEEN 3 AND 10),

                location GEOGRAPHY(POINT, 4326) NOT NULL,
                location_accuracy_meters NUMERIC(8,2),
                location_source VARCHAR(20) DEFAULT 'gps'
                    CHECK (
                    location_source IN (
                        'gps',
                        'manual_pin',
                        'geocoded',
                        'admin'
                    )),
                                
                is_default BOOLEAN DEFAULT FALSE,
                
                deleted_at TIMESTAMPTZ,

                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        `);

    
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_addresses_user_id 
            ON addresses(user_id)
            WHERE deleted_at IS NULL;
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_addresses_location
            ON addresses USING GIST(location)
            WHERE deleted_at IS NULL;
        `);
        
        await pool.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_default_address
            ON addresses(user_id, is_default)
            WHERE deleted_at IS NULL;
        `);

        // put trigger on update
        console.log("Addresses table and indexes created successfully");

    }catch(err){
        console.error("Addresses Table creation failed", err);
    }
};


export default createAddressesTable;