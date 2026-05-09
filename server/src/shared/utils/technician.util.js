import pool from '#config/db.js';
import ApiError from './apiError.js';


const checkUserDetails = async (user)=>{
    if(
        !user.is_primary_phone_number_verified || 
        !user.is_email_verified
    ){
        throw new ApiError(
            404,
            "Verify your primary phone number and email first"
        );
    }
    
    if(
        user.gender === "not_shared" || 
        user.date_of_birth === null ||
        user.profile_picture_url === null
    ){
        throw new ApiError(
            404,
            "Please complete your profile with gender, DOB, and profile picture"
        );
    }

    let query = `
        SELECT id 
        from addresses
        WHERE user_id = $1
            AND deleted_at IS NULL
        LIMIT 1;
    `;

    let result = await pool.query(query,[user.id]);

    if(result.rowCount === 0){
        throw new ApiError(
            404,
            "Please add at least one address before registering as technician"
        );
    }
    
    return true;
};

const formatTechnicianProfile = (user,technician) => ({
  username: user.username,
  email: user.email,
  firstName: user.first_name,
  lastName: user.last_name,
  primaryPhoneNumber: user.primary_phone_number,
  countryCode: user.country_code,
  isPrimaryPhoneNumberVerified: user.is_primary_phone_number_verified,
  gender: user.gender,
  profilePictureUrl: user.profile_picture_url,
  bio: user.bio,
  isEmailVerified: user.is_email_verified,
  role: user.role,
  status: user.status,
  totalBookings: user.total_bookings,
  totalMoneySpend: user.total_money_spend,
  totalMoneySave: user.total_money_save,
});

const formatDocument = (user,technician) => ({
});


export {
    checkUserDetails,
    formatTechnicianProfile,
    formatDocument
};