import {
    ApiError,
    hashPassword,
    hasEmpty,
    isValidPhone,
    isValidEmail,
} from '#shared';


const normalizeRegisterData = (body) => {
    return{
        email: body.email?.trim().toLowerCase().replace(/"/g, ""),
        username: body.username?.trim().toLowerCase(),
        first_name: body.first_name?.trim(),
        last_name: body.last_name?.trim(),
        bio: body.bio?.trim() || "User",
        gender: body.gender?.trim() || "not_shared",
        password: body.password?.trim(),
        phone: body.phone?.trim(),
        date_of_birth: body.date_of_birth || null
    };
};

const validateRegisterData = (data) => {
    const requiredFields = [
        data.email,
        data.username,
        data.first_name,
        data.last_name,
        data.password,
        data.phone
    ];

    if (hasEmpty(requiredFields)) {
        throw new ApiError(400, "All required fields are required");
    }

    isValidPhone(data.phone);
    isValidEmail(data.email);
};

const generateHashedPassword = async (password) => {
    try{
        return await hashPassword(password, 10);
    }catch(err){
        throw new ApiError(500, "Password hashing failed");
    }
};


export {
    normalizeRegisterData,
    validateRegisterData,
    generateHashedPassword
}