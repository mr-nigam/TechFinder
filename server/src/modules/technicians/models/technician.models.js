import pool from '#config/db';


const createTechniciansTable = async () => {
  try {
    // Enable PostGIS if not already enabled
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS postgis;
    `);

    // Create Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS technicians (
        -- Primary Keys
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

        -- Verification / Status
        is_verified BOOLEAN DEFAULT FALSE,

        status VARCHAR(20) NOT NULL
          CHECK (
            status IN (
              'available',
              'busy',
              'offline',
              'suspended'
            )
          )
          DEFAULT 'offline',

        service_radius_km INT DEFAULT 10
          CHECK (service_radius_km BETWEEN 1 AND 50),

        -- GEO Location
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

        -- Ratings / Performance
        average_rating NUMERIC(2,1) DEFAULT 0
          CHECK (average_rating BETWEEN 0 AND 5),

        total_reviews INT DEFAULT 0
          CHECK (total_reviews >= 0),

        total_jobs_completed INT DEFAULT 0
          CHECK (total_jobs_completed >= 0),

        -- Soft Delete / Deactivation
        deleted_at TIMESTAMPTZ,
        deactivated_at TIMESTAMPTZ,

        -- Audit
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ranking Index
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tech_search_rank
      ON technicians (
        average_rating DESC,
        total_jobs_completed DESC
      )
      WHERE is_verified = TRUE
        AND status = 'available'
        AND deleted_at IS NULL
        AND deactivated_at IS NULL;
    `);

    // GEO Index for nearest technician search
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tech_location
      ON technicians
      USING GIST(current_location);
    `);

    // Status Index
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tech_status
      ON technicians(status);
    `);

    console.log("Technicians table and indexes created successfully");

  }catch(err){
    console.error("Technicians table creation failed:", err);
  }
};


export default createTechniciansTable;