import login
from './handlers/login.handler.js';

import verifyEmail
from './handlers/verify-email.handler.js';

import verifyPhone
from './handlers/verify-phone.handler.js';

import forgotPassword
from './handlers/forgot-password.handler.js';


const otpHandlers = {
    "login":
        login,

    "phone":
        verifyPhone,

    "email":
        verifyEmail,

    "forgot-password":
        forgotPassword
};


export default otpHandlers;