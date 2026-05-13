import {
    sendEmailOtp
} from '../services/otp.service.js';

import {
    setCache
} from '#lib/cache.js';

import {
    generateOtp
} from '#shared';

import verifyEmailMessageTemplate 
from '../templates/verify-email.template.js';


const verifyEmail = async(data) =>{
    const otp = generateOtp();

    const message = 
        verifyEmailMessageTemplate(data.username,otp);
    
    await sendEmailOtp(data, message.email);

    const verifyEmailKey = 
        `verify:email:${data.userId}`;

    await setCache(
        verifyEmailKey,
        otp,
        180
    );
};


export default verifyEmail;