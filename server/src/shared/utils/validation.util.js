import ApiError from './apiError.js';

const hasEmpty = (arr = []) => {
    return arr.some((value) => {
        return (
            value === undefined ||
            value === null ||
            value === ""
        );
    });
};

// read about this 
const isValidUUID = (value) => {
    if(typeof value !== "string"){
        return false;
    }

    const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    return uuidRegex.test(
        value.trim()
    );
};

const isValidPhone = (phone) => {
    phone = String(phone).trim();

    // Phone number digits only
    const phoneRegex = /^\+[1-9][0-9]{6,14}$/;

    if(!phoneRegex.test(phone)){
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

const isValidEmail = (email) => {
    const regex =
        /^[A-Za-z0-9]+([._%+-]?[A-Za-z0-9]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

    if(!regex.test(email)){
        throw new ApiError(
            400,
            "email must be in valid format"
        );
    }
    return {
        valid: true,
        message: "Valid email"
    };
}

export {
    hasEmpty,
    isValidUUID,
    isValidPhone,
    isValidEmail
};