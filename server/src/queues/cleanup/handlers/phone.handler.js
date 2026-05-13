import pool from 
'#config/database/postgres.js';


const deletePhone = async (phoneId) => {
    let query = `
        DELETE FROM phones
        WHERE id = $1;
    `;

    let result = await pool.query(
        query,
        [phoneId]
    );

    if(result.rowCount === 0){
        throw new Error("Failed to delete phone number")
    }
};


export default deletePhone;