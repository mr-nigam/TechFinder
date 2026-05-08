import pool from '#config/db';
import createUpdatedAtTrigger from '#shared/utils/dbTriggers.util';


const createNotificationsTable = async() => {
    try{
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                recipient_id UUID NOT NULL 
                recipient_type VARCHAR(20) NOT NULL
                    CHECK (
                        recipient_type IN (
                            'user',
                            'technician',
                            'admin'
                        )
                    ),

                title VARCHAR(255),

                body TEXT,

                type VARCHAR(20) NOT NULL
                    CHECK (type IN (
                        'info',
                        'success',
                        'warning',
                        'promotion'
                    )),
                
                is_read BOOLEAN DEFAULT false,

                metadata JSONB DEFAULT '{}'::jsonb,
                
                expires_at TIMESTAMPTZ,
                deleted_at TIMESTAMPTZ,
                
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS user_notifications_idx
            ON notifications(user_id)
            WHERE deleted_at IS NULL;
        `);

        await createUpdatedAtTrigger('notifications');

        console.log("Notifications table and indexes created successfully");
        
    }catch(err){
        
        console.error("Notifications table creation failed:", err);
    }
};


export default createNotificationsTable;