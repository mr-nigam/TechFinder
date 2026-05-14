import pool from 
'#config/database/postgres.js';

import createUpdatedAtTrigger from '#shared';


const createTechnicianSkillsTable = async() => {
    try{
        await pool.query(`
            CREATE TABLE IF NOT EXISTS technician_skills(
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                technician_id UUID NOT NULL
                    REFERENCES technicians(id) ON DELETE CASCADE,

                service_id UUID NOT NULL
                    REFERENCES services(id) ON DELETE CASCADE,

                service_name VARCHAR(100) NOT NULL,

                years_of_experience NUMERIC(4,1) DEFAULT 0
                    CHECK (years_of_exp >= 0),
                
                level VARCHAR(20) NOT NULL DEFAULT 'beginner'
                    CHECK (level IN (
                        'beginner',
                        'intermediate',
                        'advanced',
                        'expert'
                    )),

                hourly_rate NUMERIC(10,2) NOT NULL
                    CHECK (hourly_rate >=0 )
                    DEFAULT 0,

                deleted_at TIMESTAMPTZ,
                
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

                UNIQUE(technician_id, service_id)
            );
        `)
        
        // Indexing
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_tech_skills_technician
            ON technician_skills(technician_id);
        `);
        
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_tech_skills_service_active
            ON technician_skills(service_id)
            WHERE is_active = true;
        `);

        await createUpdatedAtTrigger('technician_skills');
        
        console.log("Technician Skills table and indexes created successfully");

    }catch(err){

        console.error("Technician Skills Table creation failed", err);
    }
};


export default createTechnicianSkillsTable