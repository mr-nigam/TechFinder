import pool from '../db/db.js';


const createTechniciansDocumentsTable = async() => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS technician_documents (
                -- Key
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                technician_id UUID NOT NULL
                    REFERENCES technicians(id) ON DELETE CASCADE,
                
                verified_by UUID REFERENCES users(id),

                -- Document Details
                document_name VARCHAR(150) NOT NULL,
                document_type VARCHAR(50) NOT NULL,

                mime_type VARCHAR(50),
                file_url TEXT NOT NULL,

                file_size_bytes INT
                    CHECK (file_size_bytes >= 0),
                
                is_primary BOOLEAN DEFAULT FALSE,
                
                -- Verification
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

                -- Audit
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                verified_at TIMESTAMPTZ,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // Indexing
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_docs_technician
            ON technician_documents(technician_id);
        `);
        
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_docs_status
            ON technician_documents(verification_status);
        `);
        
        console.log("Document table and indexes created successfully");
    
    }catch(err){

        console.error(" Document Table creation failed", err);
    }
};


export default createTechniciansDocumentsTable;