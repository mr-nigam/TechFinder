// utils
export { default as ApiError } from './utils/apiError.js';
export { default as ApiResponse } from './utils/apiResponse.js';
export { default as asyncHandler } from './utils/asyncHandler.js';
export { default as removeLocalFile } from './utils/file.js';

// password
export { default as hashPassword } from './utils/password.util.js';
export { default as formatMyProfile } from './utils/user.util.js';

// DB triggers
export { 
    default as createUpdatedAtTrigger 
} from './utils/dbTriggers.util.js';

// tokens
export {
    generateAccessToken,
    generateRefreshToken,
} from './utils/tokens.util.js';

// cookies
export {
    getAccessTokenCookieOptions,
    getRefreshTokenCookieOptions,
    setAuthCookies,
    clearAuthCookies
} from './utils/cookie.util.js';

// validation
export {
    hasEmpty,
    isValidUUID,
    isValidPhone,
    isValidEmail
} from './utils/validation.util.js';


// address
export {
    formatOwnAddress,
    formatBookingAddress,
    formatAddressAssets,
    formatMultipleAddress
} from './utils/address.util.js';

// technician
export {
    checkUserDetails,
    formatTechnicianProfile,
    formatDocument
} from './utils/technician.util.js';

export {
    default as generateOtp
} from './utils/generateOtp.util.js';

export { 
    default as parseAndValidateCoordinates
} from './utils/location-validator.utils.js';

export {
    default as validateReviewData
} from './utils/validate-review-data.js';