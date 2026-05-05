const formatMyProfile = (user) => ({
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

export default formatOwnUser;
