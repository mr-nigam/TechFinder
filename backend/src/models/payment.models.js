import pool from '../db/db.js';


const createPaymentsTable = async() => {
    try{
        await pool.query(`
            CREATE TABLE IF NOT EXISTS payments(
                -- Keys
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                booking_id UUID UNIQUE NOT NULL
                    REFERENCES bookings(id),

                -- Amount details 
                amount NUMERIC(10,2) NOT NULL
                    CHECK (amount >= 0),
                
                tax_amount NUMERIC(10,2) NOT NULL
                    CHECK (tax_amount >= 0),
                    
                platform_fee NUMERIC(10,2) NOT NULL
                    CHECK (platform_fee >= 0),

                discount_amount NUMERIC(10,2) NOT NULL
                    CHECK (platform_fee >= 0),
                
                coupon_code NUMERIC(10,2) NOT NULL
                    CHECK (platform_fee >= 0),
                
                final_amount NUMERIC(10,2) NOT NULL
                    CHECK (platform_fee >= 0),
                
                technician_payout_amount NUMERIC(10,2) NOT NULL
                    CHECK (technician_payout_amount >= 0),
                
                currency text NOT NULL default 'INR',
                
                -- Payment Processing 
                payment_method VARCHAR(20) NOT NULL DEFAULT 'upi'
                    CHECK (payment_method IN(
                        'cash',
                        'card',
                        'upi',
                        'wallet',
                        'net banking'
                    )),

                payment_status VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (payment_status IN(
                        'pending',
                        'paid',
                        'failed',
                        'refunded'
                    )),
                
                gateway_name TEXT NOT NULL,
                gateway_transaction_id TEXT UNIQUE NOT NULL,
                gateway_order_id TEXT UNIQUE NOT NULL,

                -- failure/ refund
                failure TEXT,
                refund_reason TEXT,

                -- Audit
                paid_at TIMESTAMPTZ,
                failed_at TIMESTAMPTZ,
                refunded_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_payment_booking
            ON payments(booking_id);
        `);
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_payment_paid_at
            ON payments(paid_at);
        `);

        console.log("Payments table and indexes created successfully");

    }catch(err){

        console.error("Payments Table creation failed", err);
    }
};


export default createPaymentsTable;
