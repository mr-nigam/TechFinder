import pool from '#config/db.js';

import {
    ApiError,
    ApiResponse,
    asyncHandler,
    
    hasEmpty,
    isValidPhone,
    isValidEmail,
    
    uploadOnCloudinary,
    removeLocalFile
} from '#shared';

import {
    cleanupQueue
} from '#queues';


const addPhone = asyncHandler(async (req, res) => {
    const user = req.user;

    let {phone, phone_type} = req.body;

    phone = phone?.trim() || "";
    phone_type = phone_type?.trim() || "alternate";

    if(!phone){
        throw new ApiError(
            400,
            "Phone number is missing"
        );
    }
    
    isValidPhone(phone);

    const allowedPhoneTypes = [
        "family",
        "whatsapp",
        "emergency",
        "alternate",
    ];

    if(!allowedPhoneTypes.includes(phone_type)){
        throw new ApiError(
            400,
            "Invalid phone type"
        );
    }

    let addedPhone;
    try{
        const query = `
            INSERT INTO phones(
                user_id,
                phone,
                phone_type
            )
            VALUES( $1, $2, $3 )
            RETURNING 
                id,
                phone,
                phone_type,
                created_at;
        `;

        const values = [
            user.id,
            phone,
            phone_type,
        ];
        
        const result = await pool.query( query, values);

        addedPhone = result.rows[0];

    }catch(err){
        if(err.code === "23505"){
            throw new ApiError(
                409,
                "Phone number already exists"
            );
        }
        
        throw new ApiError(
            500,
            "Phone Number addition failed"
        );
    }
    
    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                { phone: addedPhone },
                "Phone Number added successfully"
            )
        );
});

const getPhones = asyncHandler(async (req, res) => {
    const user = req.user;

    const query = `
        SELECT 
            id,
            phone,
            phone_type,
            created_at
        FROM phones
        WHERE user_id = $1
            AND deleted_at IS NULL
        ORDER BY created_at ASC;
    `;
    
    const result = await pool.query(query, [user.id]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                result.rows,
                "Phone numbers fetched successfully"
            )
        );
});

const deletePhone = asyncHandler(async (req, res) => {
    const phoneId = req.params.phoneId;
    const user = req.user;

    if(!isValidUUID(phoneId)){
        throw new ApiError(
            404,
            "Invalid phone number id"
        );
    }

    const query = `
        UPDATE phones
        SET deleted_at = NOW()
        WHERE id = $1
            AND user_id = $2
            AND deleted_at IS NULL;
    `;

    const result = await pool.query(
        query,
        [phoneId, user.id]
    );

    
    if(result.rowCount === 0){
        throw new ApiError(
            400,
            "Phone number not found"
        );
    }

    try{
        await cleanupQueue.add(
            "phone:delete",
            { 
                phoneId: phoneId,
            },
            {
                jobId: `phone:delete:${phoneId}`,
            }
        );

    }catch(err){
        console.error("Queue error:", err.message);       
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Phone number deleted successfully"
            )
        );

});


export {
    addPhone,
    getPhones,
    deletePhone,
};