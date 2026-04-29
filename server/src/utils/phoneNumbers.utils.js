import ApiError from "./apiError.js";


const isValidPhoneNumber = ({
    phone_number = "",
    country_code = ""
}) => {
    const phone = String(phone_number).trim();
    const code = String(country_code).trim();

    // Country code must be like +91, +1, +44
    const countryCodeRegex = /^\+[1-9]\d{0,3}$/;

    // Phone number digits only
    const phoneRegex = /^\d+$/;

    if (!countryCodeRegex.test(code)) {
        throw new ApiError(
            404,
            "Invalid country code"
        );
    }

    if (!phoneRegex.test(phone)) {
        throw new ApiError(
            404,
            "Phone number must contain digits only"
        );
    }

    // International standard usually 6 to 15 digits
    if (phone.length < 6 || phone.length > 15) {
        throw new ApiError(
            404,
            "Phone number must be between 6 and 15 digits"
        );
    }

    return {
        valid: true,
        message: "Valid phone number"
    };
};

const formatPhoneNumbers = () => ({});


export {
    isValidPhoneNumber,
    formatPhoneNumbers
}