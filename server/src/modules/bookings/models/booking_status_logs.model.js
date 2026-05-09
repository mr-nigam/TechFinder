import pool from '#config/db.js';
import { createUpdatedAtTrigger } from '#shared';


const createBookingStatusLogsTable = async() => {
    try{
        await pool.query(`
            CREATE TABLLE IF NOT EXISTS booking_status_logs (
                id UUID PRIMARY KEY 
                    DEFAULT gen_random_uuid(),

                booking_id UUID NOT NULL
                    REFERENCES bookings(id),
                
                old_status VARCHAR(20),
                new_status VARCHAR(20),
                changed_by VARCHAR(20),
                notes TEXT,

                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            );
        `);
        
        await pool.query(`
            CREATE INDEX IF NOT EXISTS bookings_status_log_idx
            ON booking_status_logs(
                booking_id,
                created_at DESC
            );
        `);

        console.log("Booking-status-logs table and indexes created successfully");
    }catch(err){

        console.error("Booking-status-logs Table creation failed", err);
    }
};


export default createBookingStatusLogsTable;