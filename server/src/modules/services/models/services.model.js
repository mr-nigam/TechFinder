import pool from 
'#config/database/postgres.js';

import { 
    createUpdatedAtTrigger 
} from '#shared';


const createServicesTable = async() => {
    try{
        await pool.query(`
            CREATE TABLE IF NOT EXISTS services(
                id UUID PRIMARY KEY 
                    DEFAULT gen_random_uuid(),

                service_category_id UUID NOT NULL
                    REFERENCES service_categories(id) 
                    ON DELETE CASCADE,

                service_name VARCHAR(100) NOT NULL,
                service_category_name VARCHAR(100) NOT NULL,

                slug VARCHAR(120) UNIQUE NOT NULL,

                description TEXT,
                image_url TEXT,

                estimated_duration_minutes INT DEFAULT 60
                    CHECK (
                        estimated_duration_minutes BETWEEN 5 AND 1440
                    ),

                is_active BOOLEAN DEFAULT TRUE,

                display_order INT DEFAULT 0
                    CHECK (display_order >= 0),

                base_fee NUMERIC(8,2) NOT NULL,
                tax_amount NUMERIC(8,2) NOT NULL,
                technician_payout NUMERIC(8,2) NOT NULL,

                deleted_at TIMESTAMPTZ,
                
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

                UNIQUE(category_id, service_name)
            );    
        `);
        
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_services_category
            ON services(category_id)
            WHERE is_active = TRUE
            AND deleted_at IS NULL;
        `);
        
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_services_active_order
            ON services(display_order)
            WHERE is_active = true;
        `);

        await createUpdatedAtTrigger('services');

        console.log("Services table and indexes created successfully");

    }catch(err){

        console.error("Services Table creation failed", err);
    }
};


export default createServicesTable;