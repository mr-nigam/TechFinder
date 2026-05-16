import pool from 
'#config/database/postgres.js';

import {
    ApiError,
} from '#shared';

 /*
    extract coordinates
    current_location is geography(Point,4326)

    ST_X = longitude
    ST_Y = latitude
*/

const getCoordinates = async(technicianId) => {
    const query = `
        SELECT
            ST_X(current_location::geometry) AS longitude,
            ST_Y(current_location::geometry) AS latitude
        FROM technicians
        WHERE id = $1
    `;

    const result = await pool.query(
        query,
        [technicianId]
    );

    return result.rows[0];
};


export default getCoordinates;