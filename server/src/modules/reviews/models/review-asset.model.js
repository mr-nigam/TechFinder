import pool from 
'#config/database/postgres.js';


const createReviewsAssetsTable = async() => {
    try{
        await pool.query(`
            CREATE TABLE IF NOT EXISTS reviews_assets (
                id UUID PRIMARY KEY 
                    DEFAULT gen_random_uuid(),
                
                review_id UUID 
                    REFERENCES reviews(id)
                    ON DELETE CASECADE,
                
                media_type VARCHAR(20) NOT NULL
                    CHECK(media_type IN (
                        'image',
                        'video'
                    )),

                public_id TEXT UNIQUE NOT NULL,
                asset_url TEXT NOT NULL
                    CHECK (asset_url ~ '^https?://'),

                size_bytes INT NOT NULL,
                duration NUMERIC(8,2)
                    CHECK (
                        (media_type = 'videos' AND duration IS NOT NULL)
                        OR (media_type != 'videos')
                    ),
            
                deleted_at TIMESTAMPTZ,

                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        await pool.query(`
            CREATE INDEX IF NOT EXISTS reviews_assets_idx
            ON reviews_assets(review_id)
            WHERE deleted_at IS NULL;
        `);

        console.log("Reviews Assets table and indexes created successfully");

    }catch(err){
        console.error("Reviews Assets Table creation failed", err);
    }
};


export default createReviewsAssetsTable;