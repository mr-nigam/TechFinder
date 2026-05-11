import bcrypt from 'bcrypt';
import pool from '#config/db.js';

import { 
    getCache,
    setCache,
    deleteCache,
    deleteMultipleCache
} from '#lib/cache.js';

import {
    ApiError,
    ApiResponse,
    asyncHandler,

    checkUserDetails,
    formatTechnicianProfile
} from '#shared';

import { 
    emailQueue,
    cleanupQueue
} from '#queues';


const TECHNICIAN_PROFILE_FIELDS = `
    id,
    specialization,
    about,
    languages_spoken,
    verification_status,
    verified_at,
    status,
    service_radius_km,
    last_seen_at,
    ST_GeoJSON(current_location) AS current_location,
    current_location_captured_at,
    current_location_accuracy_meters,
    location_source,
    average_rating,
    total_reviews,
    total_jobs_completed,
    total_money_earned,
    created_at
`;

const register = asyncHandler(async (req, res) => {
    const user = req.user;
    
    await checkUserDetails(user);

    let {
        specialization = "",
        about = "",
        languages_spoken = [],
        service_radius_km = 15,
    } = req.body;
        
    const normalized = {
        specialization:specialization?.trim() || "",
        about : about?.trim() || ""
    };

    if(!normalized.specialization ||
        !normalized.about ||
        !Array.isArray(languages_spoken) ||
        languages_spoken.length === 0
    ){
        throw new ApiError(
            400,
            "All required fields must be provided"
        );
    }
    
    if(service_radius_km<0) {
        service_radius_km = 15;
    }

    const client = await pool.connect();
    
    try{
        await client.query("BEGIN");
        
        let query = `
            INSERT INTO technicians(
                user_id,
                specialization,
                about,
                languages_spoken,
                service_radius_km
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING ${TECHNICIAN_PROFILE_FIELDS};
        `;

        let values = [
            user.id,
            normalized.specialization,
            normalized.about,
            languages_spoken,
            service_radius_km
        ];

        let result = await client.query(query,values);

        if(result.rowCount === 0){
            throw new ApiError(
                500,
                "Technician registration failed"
            );
        }

        query = `
            UPDATE users 
            SET role = 'technician'
            WHERE id = $1;
        `;

        await client.query(query,[user.id]);
        
        let technician = {
            ...result.rows[0],
            phone: user.phone,
        };
        
        myProfile = formatTechnicianProfile(user,technician);

        await client.query("COMMIT");

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    myProfile,
                    "Technician registered successfully"
                )
            );
    }catch(err){
        await client.query("ROLLBACK");
        
        if(err.code === "23505"){
            throw new ApiError(
                409,
                "Technician profile already exists"
            );
        }

        throw new ApiError(
            err.statusCode || 500,
            err.message || "Technician registration failed"
        );

    }finally{
        await client.release();
    }
});

const getProfile = asyncHandler(async (req, res) =>{
    const user = req.user;
    const technician = req.technician;
    
    if(!technician){
        throw new ApiError(
            404,
            "Technician profile not found"
        );
    }

    const cacheKey = `profile:technician:${technician.id}`;
    let profile;

    profile = await getCache(cacheKey);


    if(!profile){
        const query = `
            SELECT ${TECHNICIAN_PROFILE_FIELDS} 
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

        profile = formatTechnicianProfile(user,techie);

        await setCache(cacheKey,profile,600);
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                profile,
                "Technician profile fetched successfully"
            )
        );
});

const updateProfile = asyncHandler(async (req, res) =>{ 
    const user = req.user;
    const technician = req.technician;
    
    let {
        about = "",
        languages_spoken = [],
        service_radius_km = 15,
    } = req.body;

    about = about?.trim() || "";
    
    if( !about ||
        !Array.isArray(languages_spoken) ||
        languages_spoken.length === 0
    ){
        throw new ApiError(
            400,
            "All required fields must be provided"
        );
    }

    if(service_radius_km<0) {
        service_radius_km = 15;
    }
    
    let query = `
        UPDATE technicians
        SET about = $1,
            languages_spoken = $2
            service_radius_km = $3
        WHERE id = $4
        RETURNING ${TECHNICIAN_PROFILE_FIELDS};
    `;
    const values = [
        about,
        languages_spoken,
        service_radius_km,
        technician.id
    ];

    const result = await pool.query(query,values);

    if(result.rowCount === 0){
        throw new ApiError(
            400,
            "Technician profile updation falied"
        );
    }

    const profile = formatTechnicianProfile(user,result.rows[0]);

    const cacheKey = `profile:technician:${technician.id}`;
    
    try{
        await deleteCache(cacheKey);
        await setCache(cacheKey,profile,600);
    }catch(err){
        console.error("Redis Err: ",err.message);
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                profile,
                "Technician profile updated successfully"            
            )
        );
});

const deleteAccount = asyncHandler(async (req, res) =>{
    const user = req.user;
    const technician = req.technician;
    
    if(!technician){
        throw new ApiError(
            404,
            "Technician profile not found"
        );
    }

    const password = req.body.password?.trim() || "";

    if(!password){
        throw new ApiError(
            400,
            "Please enter password"
        );
    }

    let query = `
        SELECT 
            password
        FROM users
        WHERE id = $1;
    `;
    
    let result = await pool.query(query,[user.id]);

    if(result.rows.length === 0){
        throw new ApiError(
            401,
            "Invalid credentials"
        );
    }

    let oldHashedpassword = result.rows[0].password;
    const isMatch = await bcrypt.compare(password,oldHashedpassword);

    if(!isMatch){
        throw new ApiError(
            401,
            "Invalid credentials"
        );
    }

    const client = await pool.connect();

    try{
        await client.query("BEGIN");

        let query = `
            UPDATE technicians
                SET deleted_at = NOW(),
                status = 'offline'
            WHERE id = $1; 
        `;
        
        await client.query(query,[technician.id]);

        query = `
            UPDATE users
                set role = 'user',
                refresh_token = NULL
            WHERE id = $1;
        `;

        await client.query(query,[user.id]);

        await client.query("COMMIT");

    }catch(err){
        try {
            await client.query("ROLLBACK");
        } catch (_) {}

        throw new ApiError(
            err.statusCode || 500,
            err.message || "Technician profile deletion failed"
        );

    }finally{
        client.release();
    }   

    res.clearCookie(
        "accessToken",
        {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        }
    );
    
    res.clearCookie(
        "refreshToken",
        {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        }
    );

    const cacheKeys = [
        `auth:user:${user.user.id}`,
        `auth:user:${technician.id}`,
        `auth:user:${user.username}`,
        `auth:user:${user.email}`,
        `auth:user:${user.phone}`
    ].filter(Boolean);

    await deleteMultipleCache(cacheKeys);

    try{
        await cleanupQueue.add(
            "technician:delete:account",
            { 
                userId: user.id,
                technicianId: technician.id
            },
            { 
                jobId: `technician:delete:${technician.id}`,
                delay: 30 * 24 * 60 * 60 * 1000 // 30 days
            }
        );

        console.log("Technician account scheduled for deletion in 30 days.");
    }catch(err){
        console.error("Queue error:", err.message);
    }

    try{
        await emailQueue.add(
            "request-delete-account",
            {
                userId: user.id,
                technicianId: technician.id
            },
            {
                jobId: `technician:deleted:email:${technician.id}`
            }
        );

        console.log("Email will be sent for technician account deactivation/deletion in 30 days.");
    }catch(err){
        console.error("Queue error:", err.message);
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Technician account deleted successfully. It will be permanently deleted after 30 days."
            )
        );

});

const updateCurrentLocation = asyncHandler(async (req, res) =>{
    const technician = req.technician;

    if(!technician){
        throw new ApiError(
            404,
            "Technician profile not found"
        );
    }

    let {
        lat,
        lng,
        captured_at,
        accuracy_meters,
        source
    } = req.body;

    if(lat === undefined || lng === undefined){
        throw new ApiError(
            400,
            "Give proper locations coordinates"
        );
    }

    lat = Number(lat);
    lng = Number(lng);

    if(isNaN(lat) ||
        isNaN(lng) || 
        lat > 90 ||
        lat < -90 ||
        lng > 180 ||
        lng < - 180
    ){
        throw new ApiError(
            400,
            "Invalid Lonigitude and Latitude coordinates"
        );
    }

    const allowedSources = [
        "gps",
        "manual_pin",
        "geocoded",
        "admin"
    ];
    
    if(!allowedSources.includes(source)){
        source = "gps";
    }

    const query = `
        UPDATE technicians
        SET current_location = ST_SetSRID(
                ST_MakePoint($1,$2), 
                4326
            ),
            current_location_captured_at = $3,
            current_location_accuracy_meters = $4,
            location_source  = $5
        WHERE id = $6
        RETURNING ${TECHNICIAN_PROFILE_FIELDS};
    `;

    const values = [
        lng,
        lat,
        captured_at,
        accuracy_meters,
        source,
        technician.id
    ];

    const result = await pool.query(query,values);

    const location = result.rows[0];
    
    if(!location){
        throw new ApiError(
            500,
            "Failed to update the current location"
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                location,
                "Current location updated successfully"
            )
        );
});

const verifyTechnician = asyncHandler(async (req, res) =>{ });


export {
    register,
    getProfile,
    updateProfile,
    deleteAccount,
    updateCurrentLocation,
    verifyTechnician
};