import client from '#lib/twilioClient';


const generateOtp = (length = 6) => {
  return Math.floor(
    Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)
  ).toString();
};

const sendOtp = async (phone)=>{
    const otp = generateOtp();

    try{
        await client.messages.create({
            body: `Your OTP is ${otp}`,
            from: process.env.TWILIO_PHONE,
            to: phone,
        });

        return { success: true };

    }catch(error){
        
        console.error('Twilio error:', error.message);
        throw new Error(
            500,
            'Failed to send OTP'
        );
    }
};


export default sendOtp;