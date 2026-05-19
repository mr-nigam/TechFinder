import pool from 
'#config/database/postgres.js';

import { 
    createUpdatedAtTrigger 
} from '#shared';


const createBookingsTable = async () => {
    try{
        await pool.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id UUID PRIMARY KEY 
                    DEFAULT gen_random_uuid(),

                booking_code VARCHAR(20)
                    UNIQUE NOT NULL,
                
                search_session_id VARCHAR(50) 
                    UNIQUE NOT NULL,

                booking_request_id UUID UNIQUE
                    REFERENCES booking_requests(id),
                
                user_id UUID
                    REFERENCES users(id)
                    ON DELETE SET NULL,

                technician_id UUID
                    REFERENCES technicians(id)
                    ON DELETE SET NULL,
                
                address_id UUID
                    REFERENCES addresses(id)
                    ON DELETE SET NULL,
                
                service_category_id UUID
                    REFERENCES service_categories(id)
                    ON DELETE SET NULL,
                
                service_id UUID
                    REFERENCES services(id)
                    ON DELETE SET NULL,

                payment_id UUID
                    REFERENCES payments(id)
                    ON DELETE SET NULL,

                customer_phone VARCHAR(15)
                    CHECK (
                        phone ~ '^\\+[1-9][0-9]{6,14}$'
                    ),

                phone_type VARCHAR(10)
                    DEFAULT 'primary'
                    CHECK (
                        phone_type IN (
                            'primary',
                            'other'
                        )
                    ),

                booking_type VARCHAR(20) NOT NULL
                    DEFAULT 'instant'
                    CHECK( 
                        booking_type IN (
                            'instant',
                            'scheduled',
                            'emergency'
                        )
                    ),            
                
                service_category_name VARCHAR(120) NOT NULL,
                service_name VARCHAR(120) NOT NULL,

                customer_note TEXT,

                status VARCHAR(20) NOT NULL
                    DEFAULT 'assigned'
                    CHECK(
                        status IN(
                            'assigned',
                            'in_progress',
                            'completed',
                            'cancelled'
                        )
                    ),

                estimated_duration_minutes INT DEFAULT 60
                    CHECK (
                        estimated_duration_minutes BETWEEN 15 AND 1440
                    ),

                actual_duration_minutes INT DEFAULT 60
                    CHECK (
                        estimated_duration_minutes BETWEEN 15 AND 1440
                    ),

                base_fee NUMERIC(8,2) NOT NULL DEFAULT 0,
                addon_fee NUMERIC(8,2) NOT NULL DEFAULT 0,
                tax_amount NUMERIC(8,2) NOT NULL DEFAULT 0,
                technician_payout NUMERIC(8,2) NOT NULL DEFAULT 0,
                total_amount NUMERIC(8,2) NOT NULL DEFAULT 0,
                
                payment_status VARCHAR(20) NOT NULL
                    DEFAULT 'pending'
                    CHECK(
                        payment_status IN(
                            'pending',
                            'paid',
                            'failed',
                            'refunded'
                        )
                    ),

                cancellation_reason TEXT,

                assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                started_at TIMESTAMPTZ,
                completed_at TIMESTAMPTZ,
                cancelled_at TIMESTAMPTZ,
                scheduled_at TIMESTAMPTZ,

                scheduled_for TIMESTAMPTZ,

                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                
                CHECK (
                    base_fee >= 0 AND
                    tax_amount >= 0 AND
                    discount_amount >= 0 AND
                    technician_payout >= 0 AND
                    total_amount >= 0 AND
                    technician_payout <= total_amount AND
                    discount_amount <= total_amount
                )
            );
        `);
        
        await pool.query(`
            CREATE INDEX IF NOT EXISTS bookings_user_idx
            ON bookings(
                user_id,
                status,
                created_at DESC
            );
        `);
        
        await pool.query(`
            CREATE INDEX IF NOT EXISTS bookings_technician_idx
            ON bookings(
                technician_id,
                status,
                created_at DESC
            );
        `);
        
        await pool.query(`
            CREATE INDEX IF NOT EXISTS bookings_status_idx
            ON bookings(
                status,
                created_at DESC
            );
        `);
        
        await createUpdatedAtTrigger('bookings');

        console.log("Bookings table and indexes created successfully");

    }catch(err){

        console.error("Bookings Table creation failed", err);
    }
};


export default createBookingsTable;