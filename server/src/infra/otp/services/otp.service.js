import client from '#lib/twilioClient.js';
import transporter from '#lib/emailTransporter.js';


const sendPhoneOtp = async (data, sms)=>{
    try{
        await client.messages.create({
            body: sms,
            from: process.env.TWILIO_PHONE,
            to: data.phone,
        });

        return true;
    }catch(error){
        // console.error('Twilio error:', error.message);
        throw new Error(
             `Failed to send OTP on phone: ${err.message}`
        );
    }
};

const sendEmailOtp = async (data, message) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: data.email,
            subject: message.subject,
            text: message.text,
            html: message.html
        });

        return true;

    }catch(err){
        // console.error('Transporter error:', error.message);
        throw new Error(
            `Failed to send OTP on email: ${err.message}`
        );
    }
};


export {
    sendPhoneOtp,
    sendEmailOtp
};