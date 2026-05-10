import {
    sendPhoneOtp,
} from '../services/otp.service.js';

import {
    setCache
} from '#lib/cache.js';

import {
    generateOtp
} from '#shared';

import loginMessageTemplate 
from '../templates/login.template.js';


const forgotPassword = async(data) =>{
    
    const otp = generateOtp();

    const message = 
        loginMessageTemplate(otp);
    
    await sendEmailOtp(data, message.sms);

    const loginOtpKey = 
        `login:${data.loginToken}`;

    await setCache(
        loginOtpKey,
        otp,
        180
    );
};


export default forgotPassword;