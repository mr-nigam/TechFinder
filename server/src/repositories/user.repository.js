import pool from 
'#config/database/postgres.js';


const findActiveUserById = async (userId) => {

    const query = `
        SELECT
            id,
            email,
            phone,
            username
        FROM users
        WHERE id = $1
            AND deleted_at IS NULL
            AND deactivated_at IS NULL;
    `;

    const result = await pool.query(
        query, 
        [userId]
    );

    if(result.rowCount === 0){
        return null;
    }

    return result.rows[0];
};


export default findActiveUserById;