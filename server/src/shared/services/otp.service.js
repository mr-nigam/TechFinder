import client from '#lib/twilioClient.js';
import transporter from '#lib/emailTransporter.js';
import ApiError from '#shared/utils/apiError.js';


const generateOtp = (length = 6) => {
  return Math.floor(
    Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)
  ).toString();
};

const sendPhoneOtp = async (phone,message)=>{
    const otp = generateOtp();

    let nm = message+`: ${otp}`;

    try{
        await client.messages.create({
            body: nm,
            from: process.env.TWILIO_PHONE,
            to: phone,
        });

        return otp;

    }catch(error){
        
        console.error('Twilio error:', error.message);
        throw new Error(
            500,
            'Failed to send OTP on phone'
        );
    }
};

const sendEmailOtp = async (email,subject,message) => {
    const otp = generateOtp();

    let nm = message+`: ${otp}`;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject,
            text: nm,
        });

        return otp;

    } catch (err) {
        console.error('Email error:', err.message);

        throw new ApiError(
            400,
            'Failed to send OTP on email'
        );
    }
};


export {
    sendPhoneOtp,
    sendEmailOtp
};