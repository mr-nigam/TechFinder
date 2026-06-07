import pool from 
'#config/database/postgres.js';


const getBookings = async ({
    role,
    ownerId,
    status = "",
    bookingType = "",
    sortBy,
    sortType,
})=>{
    
    const where =
        role === "technician"
            ? "technician_id"
            : "user_id";
            
    const values = [ownerId];
    const idx = 2;

    if(status){
        where.push(`status = $${idx++}`);
        values.push(status);
    }
    
    if(bookingType){
        where.push(`booking_type = $${idx++}`);
        values.push(bookingType);
    }

    const query = `
        SELECT
            id,
            booking_code,
            service_category_name,
            service_name,
            status,
            booking_type,
            created_at
        FROM bookings
        WHERE ${conditions.join(" AND ")}
        ORDER BY ${sortBy} ${sortType};
    `;

    const result = await pool.query(
        query,
        values
    );

    return result.rows;
}

const getBookingDetails = async({
    role,
    ownerId,
    bookingId,
    bookingFields
})=>{

    const joins = [];
    const where = [`b.id = $1`];
    const params = [bookingId];

    if(role === "customer"){
        joins.push(`
            LEFT JOIN technicians t
                ON t.id = b.technician_id
                AND t.deleted_at IS NULL

            LEFT JOIN users tu
                ON tu.id = t.user_id
                AND tu.deleted_at IS NULL
        `);

        where.push(`b.user_id = $2`);
        params.push(ownerId);
    }

    if(role === "technician"){
        joins.push(`
            LEFT JOIN users cu
                ON cu.id = b.user_id
                AND cu.deleted_at IS NULL
        `);

        where.push(`b.technician_id = $2`);
        params.push(ownerId);
    }

    const query = `
        SELECT
            ${bookingFields.join(",")}
        FROM bookings b

        JOIN addresses ad
            ON b.address_id = ad.id
            AND ad.deleted_at IS NULL
        
        LEFT JOIN reviews r
            ON r.booking_id = b.id
            AND r.deleted_at IS NULL

        ${joins.join("\n")}

        WHERE ${where.join(" AND ")}
    `;

    const result = await pool.query(
        query, params
    );

    return result.rows[0];
};


export {
    getBookings,
    getBookingDetails
};