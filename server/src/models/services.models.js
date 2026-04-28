import pool from '../db/db.js';


const createServicesTable = async() => {
    try{
        await pool.query(`
            CREATE TABLE IF NOT EXISTS services(
                -- Keys
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                category_id UUID NOT NULL
                    REFERENCES service_categories(id) ON DELETE CASCADE,

                -- Service Details
                service_name VARCHAR(100) NOT NULL,
                slug VARCHAR(120) UNIQUE NOT NULL,

                description TEXT,
                image_url TEXT,

                estimated_duration_minutes INT DEFAULT 60
                    CHECK (
                        estimated_duration_minutes BETWEEN 5 AND 1440
                    ),

                -- Settings
                is_active BOOLEAN DEFAULT TRUE,

                display_order INT DEFAULT 0
                    CHECK (display_order >= 0),

                -- Deleteion Status
                is_deleted BOOLEAN DEFAULT FALSE,
                
                -- Audit
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

                -- Constraints
                UNIQUE(category_id, service_name)
            );    
        `);
        
        // Indexing
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_services_category
            ON services(category_id);
        `);
        
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_services_active_order
            ON services(display_order)
            WHERE is_active = true;
        `);

        console.log("Services table and indexes created successfully");

    }catch(err){

        console.error("Services Table creation failed", err);
    }
};


export default createServicesTable;