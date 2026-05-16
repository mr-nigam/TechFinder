import pool from 
'#config/database/postgres.js';


const getAddressCoordinates = async (
    addressId,
    userId
) => {
    const query = `
        SELECT
            ST_X(location::geometry) AS longitude,
            ST_Y(location::geometry) AS latitude
        FROM addresses
        WHERE id = $1
            AND user_id = $2
            AND deleted_at IS NULL
    `;

    const result = await pool.query(query, [
        addressId,
        userId
    ]);

    if (result.rowCount === 0) {
        throw new ApiError(
            400,
            'Address not found'
        );
    }

    return {
        lng: Number(result.rows[0].longitude),
        lat: Number(result.rows[0].latitude)
    };
};

export default getAddressCoordinates;