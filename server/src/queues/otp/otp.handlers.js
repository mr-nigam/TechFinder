import forgotPasswordHandler
from './handlers/forgotPassword.handler.js';

import verifyEmailHandler
from './handlers/verifyEmail.handler.js';

import verifyPhoneHandler
from './handlers/verifyPhone.handler.js';

import loginOTPHandler
from './handlers/loginOTP.handler.js';


const otpHandlers = {
    "otp:verify:forgot-password":
        forgotPasswordHandler,

    "otp:verify:phone":
        verifyPhoneHandler,

    "otp:verify:email":
        verifyEmailHandler,

    "otp:verify:login":
        loginOTPHandler,
};


export default otpHandlers;