import { 
    ApiError,
    isValidUUID
} from '#shared';

const ALLOWED_BOOKING_TYPES = [
    "instant",
    "emergency",
    "scheduled"
];

const validateBookingData = async (body) =>{

    const { 
        addressId,
        serviceId,
        phoneType = "primary",
        phoneId,
        bookingType,
        serviceCategoryId
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

    return {
        addressId,
        serviceId,
        serviceCategoryId,
        phoneId,
        phoneType: normalizedPhoneType,
        bookingType: normalizedBookingType
    };
};


validateBookingData