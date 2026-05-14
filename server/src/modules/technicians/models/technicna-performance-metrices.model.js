import pool from 
'#config/database/postgres.js';

import createUpdatedAtTrigger from '#shared';


const createTechnicianPerformanceMetricesTable = async () => {
    try{
        await pool.query(`
            CREATE TABLE IF NOT EXISTS technician_performance_metrics (
                id UUID PRIMARY KEY 
                    DEFAULT gen_random_uuid(),
                
                technician_id UUID UNIQUE NOT NULL 
                    REFERENCES technicians(id) 
                    ON DELETE CASCADE,
                
                experience_years INT DEFAULT 0
                    CHECK (experience_years >= 0),

                total_money_earned NUMERIC(12,2) 
                    NOT NULL DEFAULT 0
                    CHECK (total_money_earned >= 0),

                average_rating NUMERIC(3,2) DEFAULT 0
                    CHECK (average_rating BETWEEN 0 AND 5),
                
                acceptance_rate NUMERIC(3,2) DEFAULT 0
                    CHECK (acceptance_rate BETWEEN 0 AND 1),
                
                cancellation_rate NUMERIC(3,2) DEFAULT 0
                    CHECK (cancellation_rate BETWEEN 0 AND 1),
                
                completion_rate NUMERIC(3,2) DEFAULT 0
                    CHECK (completion_rate BETWEEN 0 AND 1),

                total_reviews INT DEFAULT 0
                    CHECK (total_reviews >= 0),

                total_completed INT DEFAULT 0
                    CHECK (total_completed >= 0),
                
                total_assigned INT DEFAULT 0
                    CHECK (total_assigned >= 0),
                
                total_cancelled INT DEFAULT 0
                    CHECK (total_cancelled >= 0),
                
                on_time_arrival_rate NUMERIC(3,2) DEFAULT 0
                    CHECK (on_time_arrival_rate BETWEEN 0 AND 1),
                
                ranking_score NUMERIC(6,5) DEFAULT 0
                    CHECK (ranking_score BETWEEN 0 AND 1),
                
                avg_response_time_seconds INT DEFAULT 0
                
                repeat_customer_rate 
                    NUMERIC(5,4) DEFAULT 0

                last_active_at TIMESTAMPTZ,

                deleted_at TIMESTAMPTZ,
                
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Indexing
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_user_ranking_score
            ON technician_performance_metrics(
                ranking_score DESC
            )
            WHERE deleted_at IS NULL;  
        `);
        
        await createUpdatedAtTrigger('technician_performance_metrics');

        console.log("technician_performance_metrics table created successfully");

    }catch(err){
        console.error("technician_performance_metrics Table creation failed", err);
    }
};


export default createTechnicianPerformanceMetricesTable;