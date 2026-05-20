import {
    ApiError
} from '#shared';

const STATUS_TIMESTAMP = {
    accepted:
        "accepted_at",

    rejected:
        "rejected_at",

    expired:
        "expired_at",

    cancelled:
        "cancelled_at"
};

const updateBookingRequestStatus = async(
    client,
    status,
    technicianId,
    bookingRequestId
) => {
    
    const timestampColumn =
        STATUS_TIMESTAMP[
            status
        ];
        
    if(!timestampColumn){
        throw new ApiError(
            400,
            "Not a valid status update type"
        );
    } 

    const query = `
        UPDATE booking_requests
        SET status = $1,
            technician_id = $2
            ${timestampColumn} = NOW()
        WHERE id = $3
        RETURNING  (
            to_jsonb(booking_requests)
            -'created_at',
            -'responded_at'
        ) AS booking_request;
    `;

    const result = await client.query(
        query,
        [
            status,
            technicianId,
            bookingRequestId
        ]
    );

    if(result.rowCount === 0){
        throw new ApiError(
            404,
            "booking not found"
        );
    }

    return result.rows[0].booking_request;
};


export default updateBookingRequestStatus;