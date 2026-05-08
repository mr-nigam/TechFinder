import pool from '#config/db.js';

import {
    ApiError,
    ApiResponse,
    asyncHandler,
} from '#shared';


const getDashboard = asyncHandler(async (req, res) =>{
    const user = req.user;
    const technician = req.technician;
    
    if(!technician){
        throw new ApiError(
            404,
            "Technician profile not found"
        );
    }

    const cacheKey = `dashboard:technician:${technician.id}`;
    let dashboard;

    dashboard = await getCache(cacheKey);

    if(!dashboard){
        const query = `
            SELECT *
            FROM technicians
            WHERE id = $1
            LIMIT 1;
        `;

        const result = await pool.query(query, [technician.id]);
        const techie = result.rows[0];

        if(!techie){
            throw new ApiError(
                404, 
                "technician not found"
            );
        }

        dashboard = formatTechnicianProfile(user,techie);

        await setCache(cacheKey,dashboard,600);
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                dashboard,
                "Technician dashboard fetched successfully"
            )
        );
});


export {
    getDashboard
};