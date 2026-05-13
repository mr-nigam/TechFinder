const loginMessageTemplate = (otp) => {
    return {
        sms: `
            TechFinder OTP: ${otp}

            Use this code to login in your account.

            This OTP expires in 3 minutes.

            Do not share this code with anyone.
        `.trim()
    };
};


export default loginMessageTemplate;