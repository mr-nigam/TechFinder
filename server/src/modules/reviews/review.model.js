import pool from '#config/db.js';
import { createUpdatedAtTrigger } from '#shared';


const createReviewsTable = async() => {

    try{
        await pool.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                
                user_id UUID 
                    REFERENCES users(id)
                    ON DELETE SET NULL,

                technician_id UUID NOT NULL
                    REFERENCES technicians(id)
                    ON DELETE CASCADE,

                booking_id UUID NOT NULL 
                    REFERENCES bookings(id),
                
                service_type_id UUID NOT NULL,
                    REFERENCES service_types(id)
                    ON DELETE CASCADE,
                
                service_type_name 
                    VARCHAR(120) NOT NULL,

                service_name 
                    VARCHAR(20) NOT NULL,

                booking_type VARCHAR(20) NOT NULL
                    DEFAULT 'instant'
                    CHECK( 
                        booking_type IN (
                            'instant',
                            'scheduled',
                            'emergency'
                        )
                    ),
                
                rating NUMERIC(2,1) NOT NULL 
                    DEFAULT 5,
                    CHECK( 
                        rating BETWEEN 0 AND 5
                    ),
                
                title VARCHAR(50),
                body TEXT,

                is_edited BOOLEAN DEFAULT FALSE,
                
                deleted_at TIMESTAMPTZ,

                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

                CHECK (
                    title IS NOT NULL
                    OR body IS NOT NULL
                ),

                UNIQUE(booking_id, user_id)
            );
        `);
            
        await pool.query(`
            CREATE INDEX IF NOT EXISTS reviews_user_idx
            ON reviews(user_id)
            WHERE deleted_at IS NULL;
        `);
        
        await pool.query(`
            CREATE INDEX IF NOT EXISTS reviews_technician_idx
            ON reviews(technician_id)
            WHERE deleted_at IS NULL;
        `);
        
        await pool.query(`
            CREATE INDEX IF NOT EXISTS reviews_booking_idx
            ON reviews(booking_id)
            WHERE deleted_at IS NULL;
        `);

        await createUpdatedAtTrigger("reviews");

        console.log("Reviews table and indexes created successfully");

    }catch(err){
        console.error("Reviews Table creation failed", err);
    }
};


export default createReviewsTable;