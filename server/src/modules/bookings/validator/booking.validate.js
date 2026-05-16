import { 
    ApiError,
    isValidUUID
} from '#shared';

const ALLOWED_BOOKING_TYPES = [
    "instant",
    "emergency",
    "scheduled"
];

const validateBookingData = (body) =>{
    const { 
        addressId,
        serviceId,
        phoneType = "primary",
        phoneId,
        bookingType,
        serviceCategoryId,
        page = 1,
        limit = 10
    } = body;

     const normalizedPhoneType =
        phoneType.trim().toLowerCase();

    const normalizedBookingType =
        bookingType?.trim().toLowerCase();

    const idsToValidate = [
        addressId,
        serviceId,
        serviceCategoryId
    ];

    if(normalizedPhoneType !== "primary"){
        idsToValidate.push(phoneId);
    }

    const hasInvalidId = idsToValidate.some(
        (id)=> !id || !isValidUUID(id)
    );

    if(hasInvalidId){
        throw new ApiError(
            404,
            "Invalid IDs provided"
        );
    }

    if(
        !ALLOWED_BOOKING_TYPES.includes(
            normalizedBookingType
        )
    ){
        throw new ApiError(
            400,
            "Invalid booking type"
        );
    }

    const normalizedLimit = Math.min(
        Math.max(parseInt(limit) || 10, 1),
        20
    );
    
    const normalizedPage = Math.max(
        parseInt(page) || 1, 1
    );
    
    const skip = (normalizedPage-1)*normalizedLimit;

    return {
        addressId,
        serviceId,
        serviceCategoryId,
        phoneId,
        skip,
        limit: normalizedLimit,
        page: normalizedPage,
        phoneType: normalizedPhoneType,
        bookingType: normalizedBookingType
    };
};


export default validateBookingData;