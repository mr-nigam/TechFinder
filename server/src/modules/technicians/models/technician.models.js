import pool from 
'#config/database/postgres.js';

import createUpdatedAtTrigger from '#shared';


const createTechniciansTable = async () => {
  try{
     await pool.query(`
      CREATE EXTENSION IF NOT EXISTS postgis;
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS technicians (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        user_id UUID UNIQUE NOT NULL
          REFERENCES users(id) 
          ON DELETE CASCADE,

        service_category_id UUID
          REFERENCES service_categories(id) 
          ON DELETE SET NULL,

        verified_by UUID
          REFERENCES users(id)
          ON DELETE SET NULL
        
        specialization VARCHAR(100) NOT NULL,
        about TEXT,

        search_vector tsvector

        languages_spoken TEXT[] DEFAULT '{}',

        experience_years INT DEFAULT 0
          CHECK (experience_years >= 0),

        verification_status VARCHAR(20)
        CHECK (
          verification_status IN (
            'pending',
            'approved',
            'rejected'
          )
        ) DEFAULT 'pending',

        verified_at TIMESTAMPTZ,

        status VARCHAR(20) NOT NULL
          CHECK (
            status IN (
              'online',
              'offline',
              'away'
            )
          )
          DEFAULT 'offline',

        availability_status VARCHAR(20)
            CHECK (
              availability_status IN (
                'available',
                'busy',
                'on_break'
              )
            )
          DEFAULT 'available',
        
        account_status VARCHAR(20)
          CHECK (
            account_status IN (
              'active',
              'suspended',
              'banned'
            )
          )
        DEFAULT 'active',
        
        highest_Qulification VARCHAR(20)
          CHECK (
            highest_Qulification IN (
              'high_school',
              'graduate',
              'masters',
              'doctorate'
            )
          )
        DEFAULT 'active',

        service_radius_km INT DEFAULT 15
          CHECK (service_radius_km BETWEEN 1 AND 100),

        last_seen_at TIMESTAMPTZ, 

        hourly_rate NUMERIC(10,2) NOT NULL
          CHECK (hourly_rate >=0 )
          DEFAULT 0,

        current_location GEOGRAPHY(POINT, 4326),
        current_location_captured_at TIMESTAMPTZ,
        current_location_accuracy_meters NUMERIC(8,2),
        location_source VARCHAR(20) DEFAULT 'gps'
          CHECK (
            location_source IN (
              'gps',
              'manual_pin',
              'geocoded',
              'admin'
            )
          ),

        deleted_at TIMESTAMPTZ,
        deactivated_at TIMESTAMPTZ,
        
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tech_search_rank
      ON technicians (
        average_rating DESC,
        total_jobs_completed DESC
      )
      WHERE verified_at IS NOT NULL
        AND status = 'online'
        AND deleted_at IS NULL
        AND deactivated_at IS NULL;
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tech_location
      ON technicians
      USING GIST(current_location);
    `);

    await pool.query(`
      CREATE INDEX idx_technician_search
      ON technicians
      USING GIN(search_vector);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tech_status
      ON technicians(status);
    `);

    await createUpdatedAtTrigger('technicians');

    console.log("Technicians table and indexes created successfully");

  }catch(err){
    console.error("Technicians table creation failed:", err);
  }
};


export default createTechniciansTable;