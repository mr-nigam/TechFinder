import pool from '#config/db';
import createUpdatedAtTrigger from '#shared/utils/dbTriggers.util';


const createTechniciansDocumentsTable = async() => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS technician_documents (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                technician_id UUID NOT NULL
                    REFERENCES technicians(id) ON DELETE CASCADE,
                
                verified_by UUID REFERENCES users(id),

                document_id VARCHAR(50) UNIQUE NOT NULL,
                document_name VARCHAR(150) NOT NULL,
                document_type VARCHAR(50) NOT NULL,

                mime_type VARCHAR(50),
                public_id TEXT,
                public_url TEXT,
                
                verification_status VARCHAR(20) DEFAULT 'pending'
                    CHECK(
                        verification_status in (
                            'pending',
                            'approved',
                            'rejected',
                            'expired'
                        )
                    ),

                rejection_reason TEXT,
                expiry_date DATE,

                deleted_at TIMESTAMPTZ,
                verified_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_docs_technician
            ON technician_documents(technician_id)
            WHERE deleted_at IS NULL;
        `);
        
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_docs_status
            ON technician_documents(verification_status)
            WHERE deleted_at IS NULL;
        `);
        
        await createUpdatedAtTrigger('technician_documents');

        console.log("Document table and indexes created successfully");
    
    }catch(err){

        console.error(" Document Table creation failed", err);
    }
};


export default createTechniciansDocumentsTable;