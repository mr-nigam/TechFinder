import pool from '#config/db.js';
import { createUpdatedAtTrigger } from '#shared';


const createServicesCategoriesTable = async() => {
    try{
        await pool.query(`
            CREATE TABLE IF NOT EXISTS service_categories(
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                category_name VARCHAR(100) UNIQUE NOT NULL,
                slug VARCHAR(120) UNIQUE NOT NULL,

                icon_url TEXT,
                image_url TEXT,

                description TEXT,

                is_active BOOLEAN DEFAULT TRUE,

                display_order INT DEFAULT 0
                    CHECK (display_order >= 0),

                deleted_at TIMESTAMPTZ,

                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );    
        `);
        
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_categories_active_order
            ON service_categories(display_order)
            WHERE is_active = true;
        `);

        await createUpdatedAtTrigger('service_categories');
        
        console.log("Service Categories table and indexes created successfully");

    }catch(err){

        console.error("Service Categories Table creation failed", err);
    }
};


export default createServicesCategoriesTable;