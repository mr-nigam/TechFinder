import ApiError from './apiError.js';


const isValidPhone = (phone) => {
    const phone = String(phone).trim();

    // Phone number digits only
    const phoneRegex = /^\+[1-9][0-9]{6,14}$/;

    if (!phoneRegex.test(phone)) {
        throw new ApiError(
            400,
            "Phone number must be in valid international format (e.g. +919876543210)"
        );
    }

    return {
        valid: true,
        message: "Valid phone number"
    };
};


export default isValidPhone;