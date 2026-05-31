import pool from 
'#config/database/postgres.js';

import {
    createUpdatedAtTrigger
} from '#shared';


const createNotificationsTable = async() => {
    try{
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id UUID PRIMARY KEY 
                    DEFAULT gen_random_uuid(),

                recipient_id UUID NOT NULL,
                
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

                category VARCHAR(20) NOT NULL
                    CHECK (
                        category IN (
                            'system',
                            'order',
                            'warning',
                            'promotion',
                            'payment',
                            'support'
                        )
                    ),
                
                is_read BOOLEAN DEFAULT false,

                metadata JSONB DEFAULT '{}'::jsonb,
                
                expires_at TIMESTAMPTZ,
                deleted_at TIMESTAMPTZ,
                
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

                filters VARCHAR(20) NOT NULL
                    CHECK (
                        filters IN(
                            'system',
                                'order',
                                'warning',
                                'promotion',
                                'payment',
                                'support',
                                'read',
                                'unread',
                                'created_at'
                        )
                    )


            );
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS 
            recipient_notifications_idx
            
            ON notifications(
                recipient_id,
                created_at DESC
            )
            
            WHERE deleted_at IS NULL;
        `);

        await createUpdatedAtTrigger('notifications');

        console.log("Notifications table and indexes created successfully");
        
    }catch(err){
        
        console.error("Notifications table creation failed:", err);
    }
};


export default createNotificationsTable;