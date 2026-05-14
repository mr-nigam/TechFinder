import bcrypt from 'bcrypt';
import ApiError from './apiError.js';


const hashPassword = async (password) => {
  if (password.length < 8 || password.length > 50) {
    throw new ApiError(400, "Password length must be between 8 to 50");
  }

  let hasDigit = false;
  let hasLower = false;
  let hasUpper = false;
  let hasSpecial = false;

  for (const ch of password) {
    if (ch >= "0" && ch <= "9") hasDigit = true;
    else if (ch >= "a" && ch <= "z") hasLower = true;
    else if (ch >= "A" && ch <= "Z") hasUpper = true;
    else if (ch !== " ") hasSpecial = true;
  }

  if(!hasDigit || !hasLower || !hasUpper || !hasSpecial){
    throw new ApiError(
      400,
      "Password must contain uppercase, lowercase, digit and special character"
    );
  }

  return bcrypt.hash(password, 10);
};


export default hashPassword;
