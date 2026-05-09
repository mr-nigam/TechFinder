import pool from '#config/db.js';
import { createUpdatedAtTrigger } from '#shared';


const createBookingsTable = async () => {
    try{
        await pool.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id UUID PRIMARY KEY 
                    DEFAULT gen_random_uuid(),
                
                booking_code VARCHAR(30)
                    UNIQUE NOT NULL,
                
                user_id UUID
                    REFERENCES users(id)
                    ON DELETE SET NULL,

                technician_id UUID
                    REFERENCES technicians(id)
                    ON DELETE SET NULL,
                
                address_id UUID
                    REFERENCES addresses(id)
                    ON DELETE SET NULL,
                
                phone_id UUID
                    REFERENCES phones(id)
                    ON DELETE SET NULL,
                
                -- remove
                service_id UUID
                    REFERENCES services(id)
                    ON DELETE SET NULL,
                
                payment_id UUID
                    REFERENCES payments(id)
                    ON DELETE SET NULL,
                
                service_type_id UUID
                    REFERENCES service_types(id)
                    ON DELETE SET NULL,

                booking_type VARCHAR(20) NOT NULL
                    DEFAULT 'instant'
                    CHECK( 
                        booking_type IN (
                            'instant',
                            'scheduled',
                            'emergency'
                        )
                    ),            
                
                service_name VARCHAR(120) NOT NULL,

                customer_note TEXT

                status VARCHAR(20) NOT NULL
                    DEFAULT 'pending'
                    CHECK(
                        status IN(
                            'pending',
                            'assigned',
                            'accepted',
                            'in_progress',
                            'completed',
                            'cancelled',
                            'rejected',
                            'expired'
                        )
                    ),

                base_fee NUMERIC(8,2) NOT NULL,
                tax_amount NUMERIC(8,2) NOT NULL,
                technician_payout NUMERIC(8,2) NOT NULL,
                total_amount NUMERIC(8,2) NOT NULL,

                --remove
                discount_amount NUMERIC(8,2) NOT NULL,
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

                --remove it
                cancelled_by VARCHAR(15)
                    CHECK(
                        cancelled_by IN (
                            'user',
                            'technician'
                        )
                    ),

                scheduled_for TIMESTAMPTZ,

                assigned_at TIMESTAMPTZ,
                accepted_at TIMESTAMPTZ,
                started_at TIMESTAMPTZ,
                completed_at TIMESTAMPTZ,
                cancelled_at TIMESTAMPTZ,

                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                
                CHECK (
                    base_fee > 0 AND
                    tax_amount >= 0 AND
                    discount_amount >= 0 AND
                    technician_payout >= 0 AND
                    total_amount > 0 AND
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