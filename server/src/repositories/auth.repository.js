import pool from 
'#config/database/postgres.js';


const createUser = async (userData) => {
    const query = `
        INSERT INTO users (
            username, email, first_name, last_name,
            phone, gender, bio, date_of_birth,
            profile_picture_public_id,
            profile_picture_url,
            password
        )
        VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11
        )
        RETURNING
            id,
            username,
            email,
            first_name,
            last_name,
            phone,
            role;
    `;

    const values = [
        userData.username,
        userData.email,
        userData.first_name,
        userData.last_name,
        userData.phone,
        userData.gender,
        userData.bio,
        userData.date_of_birth,
        userData.profile_picture_public_id,
        userData.profile_picture_url,
        userData.password
    ];

    const result = await pool.query(
        query, 
        values
    );

    return result.rows[0];
};


export default createUser;