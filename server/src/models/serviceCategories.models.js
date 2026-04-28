import pool from '../db/db.js';


const createServicesCategoriesTable = async() => {
    try{
        await pool.query(`
            CREATE TABLE IF NOT EXISTS service_categories(
                -- Key
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                -- Category Details
                category_name VARCHAR(100) UNIQUE NOT NULL,
                slug VARCHAR(120) UNIQUE NOT NULL,

                icon_url TEXT,
                image_url TEXT,

                description TEXT,

                -- Settings
                is_active BOOLEAN DEFAULT TRUE,

                display_order INT DEFAULT 0
                    CHECK (display_order >= 0),

                -- Deleteion Status
                is_deleted BOOLEAN DEFAULT FALSE,

                -- Audit
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );    
        `);
        
        // Indexing
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_categories_active_order
            ON service_categories(display_order)
            WHERE is_active = true;
        `);

        console.log("Service Categories table and indexes created successfully");

    }catch(err){

        console.error("Service Categories Table creation failed", err);
    }
};


export default createServicesCategoriesTable;