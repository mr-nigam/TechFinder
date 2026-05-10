import {
    sendPhoneOtp
} from '../services/otp.service.js';

import {
    setCache
} from '#lib/cache.js';

import {
    generateOtp
} from '#shared';

import verifyPhoneMessageTemplate 
from '../templates/verify-phone.template.js';


const verifyPhone = async(data) =>{
    const otp = generateOtp();

    const message = 
        verifyPhoneMessageTemplate(otp);
    
    await sendPhoneOtp(data, message.sms);

    const verifyPhoneKey = 
        `verify:phone:${data.userId}`;

    await setCache(
        verifyPhoneKey,
        otp,
        180
    );
};


export default verifyPhone;