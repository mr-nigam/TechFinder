import pool from '../db/db.js';


const createTechniciansTable = async() => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS technicians (
                -- Keys
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                user_id UUID UNIQUE NOT NULL 
                    REFERENCES users(id) ON DELETE CASCADE,
                
                address_id UUID NOT NULL 
                    REFERENCES addresses(id),

                contact_id UUID NOT NULL 
                    REFERENCES contacts(id),

                -- Profile
                professional_title VARCHAR(100) NOT NULL,
                about TEXT,

                languages_spoken TEXT[] DEFAULT '{}',

                -- Verification / Availability
                is_verified BOOLEAN DEFAULT FALSE,
                is_available BOOLEAN DEFAULT TRUE,

                service_radius_km INT DEFAULT 10 
                    CHECK (service_radius_km BETWEEN 1 AND 50),

                -- Performance Metrics
                average_rating NUMERIC(2,1) DEFAULT 0 
                    CHECK (average_rating BETWEEN 0 AND 5),

                total_reviews INT DEFAULT 0 
                    CHECK (total_reviews >= 0),

                total_jobs_completed INT DEFAULT 0 
                    CHECK (total_jobs_completed >= 0),

                -- Audit
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );    
        `);
        
        // Indexing
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_tech_search_rank
            ON technicians(
                average_rating DESC,
                total_jobs_completed DESC
            )
            WHERE is_verified = true
            AND is_available = true;
        `);

        console.log("Technician table and indexes created successfully");

    }catch(err){

        console.error("Technician Table creation failed", err);
    }
};


export default createTechniciansTable;