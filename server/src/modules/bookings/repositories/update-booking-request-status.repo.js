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
    bookingRequestId,
    status,
    client
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
            ${timestampColumn} = NOW()
        WHERE id = $2
        RETURNING id;
    `;

    const result = await client.query(
        query,
        [status, bookingRequestId]
    );

    if(result.rowCount === 0){
        throw new ApiError(
            404,
            "booking not found"
        );
    }

    return result.rows[0];
};


export default updateBookingRequestStatus;