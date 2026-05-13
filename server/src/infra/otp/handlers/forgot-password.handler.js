import {
    sendPhoneOtp,
    sendEmailOtp
} from '../services/otp.service.js';

import {
    setCache
} from '#lib/cache.js';

import {
    generateOtp
} from '#shared';

import forgotMessageTemplate 
from '../templates/forgot-password.template.js';


const forgotPassword = async(data) =>{
    
    const otp = generateOtp();

    const message = 
        forgotMessageTemplate(data.username, otp);
    
    
    await Promise.allSettled([
        sendPhoneOtp(data, message.sms),
        sendEmailOtp(data, message.email)
    ]);

    const forgotPasswordOtpKey = 
        `forgot-password:${data.forgotToken}`;

    await setCache(
        forgotPasswordOtpKey,
        otp,
        180
    );
};


export default forgotPassword;