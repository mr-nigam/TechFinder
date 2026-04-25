import pool from '../db/db.js';


const createAddressesTable = async ()=>{
    try{
        await pool.query(`
            CREATE TABLE IF NOT EXISTS addresses(
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

                address_line_1 TEXT NOT NULL,
                address_line_2 TEXT,
                landmark TEXT,

                city TEXT NOT NULL,
                state TEXT NOT NULL,
                country TEXT NOT NULL,
                
                pincode VARCHAR(20) NOT NULL,

                location GEOGRAPHY(POINT, 4326),
                
                is_default BOOLEAN DEFAULT FALSE,
                
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP

            );
        `);
        
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

        console.log("Table + indexes created successfully");

    }catch(err){

        console.log("Table creation failed", err);
    }
};


export default createAddressesTable;