const verifyPhoneMessageTemplate = (otp) => {
    return {
        sms: `
            TechFinder OTP: ${otp}

            Use this code to verify your phone number.

            This OTP expires in 3 minutes.

            Do not share this code with anyone.
        `.trim()
    };
};


export default verifyPhoneMessageTemplate;