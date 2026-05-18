import pool from 
'#config/database/postgres.js';


const createBookingsRequestsTable = async() =>{
    try{
        await pool.query(`
            CREATE TABLE IF NOT EXISTS booking_requests(
                id UUID PRIMARY KEY
                    DEFAULT gen_random_uuid(),
                
                search_session_id VARCHAR(50) UNIQUE,
            
                user_id UUID NOT NULL,

                technician_id UUID NOT NULL,

                address_id UUID NOT NULL,

                phone_id UUID,

                phone_type VARCHAR(15) NOT NULL,

                service_category_id UUID NOT NULL,
                
                service_id UUID NOT NULL,
                
                customer_note TEXT,

                booking_type VARCHAR(20) NOT NULL
                    DEFAULT 'instant'
                    CHECK( 
                        booking_type IN (
                            'instant',
                            'scheduled',
                            'emergency'
                        )
                    ),

                status request_status DEFAULT 'pending'
                    CHECK(
                        request_status IN(
                        'pending',
                        'accepted',
                        'rejected',
                        'cancelled',
                        'expired'
                        )
                    ),

                requested_at TIMESTAMP DEFAULT NOW(),

                responded_at TIMESTAMP,

                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

                UNIQUE(
                    search_session_id,
                    technician_id
                )
            );
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS bookings_search_session_idx
            ON booking_requests(
                search_session_id
            );
        `);

        console.log("Booking_Requests table and indexes created successfully");

    }catch(err){

        console.error("Booking_Requests Table creation failed", err);
    }
};


export default createBookingsRequestsTable;