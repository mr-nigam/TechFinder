import pool from '#config/db.js';
import createUpdatedAtTrigger from '#shared/utils/dbTriggers.util.js';


const createTechnicianAvailabilityTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS technician_availability (
                -- Keys
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                
                technician_id UUID NOT NULL 
                    REFERENCES technicians(id) ON DELETE CASCADE,

                -- Schedule
                day_of_week VARCHAR(10) NOT NULL
                    CHECK (
                        day_of_week IN (
                            'monday',
                            'tuesday',
                            'wednesday',
                            'thursday',
                            'friday',
                            'saturday',
                            'sunday'
                        )
                    ),
                
                start_time TIME NOT NULL,
                end_time TIME NOT NULL
                    CHECK (end_time>start_time),
                
                break_start_time TIME,
                break_end_time TIME,

                slot_duration_minutes INT DEFAULT 60
                    CHECK (slot_duration_minutes IN (15,30,45,60,90,120)),

                -- Settings
                is_active BOOLEAN DEFAULT TRUE,
                
                -- Deleteion Status
                is_deleted BOOLEAN DEFAULT FALSE,
                
                -- Audit
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP

                -- Constraints
                UNIQUE(technician_id, day_of_week)
            );
        `);

        // Indexing
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_availability_tech_day_active
            ON technician_availability(
                technician_id, 
                day_of_week
            )
            WHERE is_active = true;  
        `);
        
        await createUpdatedAtTrigger('technician_availability');

        console.log("Technician Availability table and indexes created successfully");

    }catch(err){
        console.error("Technician Availability Table creation failed", err);
    }
};


export default createTechnicianAvailabilityTable;