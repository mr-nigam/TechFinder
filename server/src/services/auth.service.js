import bcrypt from 'bcrypt';

import pool from 
'#config/database/postgres.js';

import {
    ApiError
} from '#shared';


const verifyUserPassword = async (
    userId,
    password
) => {

    const trimmedPassword =
        password?.trim() || "";

    if (!trimmedPassword) {
        throw new ApiError(
            400,
            "Please enter password"
        );
    }

    const query = `
        SELECT password
        FROM users
        WHERE id = $1;
    `;

    const result = await pool.query(
        query,
        [userId]
    );

    if (result.rowCount === 0) {
        throw new ApiError(
            404,
            "User not found"
        );
    }

    const hashedPassword =
        result.rows[0].password;

    const isMatch =
        await bcrypt.compare(
            trimmedPassword,
            hashedPassword
        );

    if (!isMatch) {
        throw new ApiError(
            401,
            "Invalid credentials"
        );
    }

    return true;
};


export default verifyUserPassword;