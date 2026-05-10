const forgotMessageTemplate = (usernme, otp) => {
    return {
        email: {
            subject: 'Reset Your TechFinder Password',

            text: `
                Hello ${usernme},

                We received a request to reset your TechFinder account password.

                Use the following OTP to reset your password:

                ${otp}

                This OTP will expire in 10 minutes.

                If you did not request a password reset, please ignore this email.

                Best regards,
                TechFinder Team
            `.trim(),

            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Hello ${usernme},</h2>

                    <p>
                        We received a request to reset your
                        <strong>TechFinder</strong> account password.
                    </p>

                    <p>
                        Use the following OTP to reset your password:
                    </p>

                    <div
                        style="
                            font-size: 28px;
                            font-weight: bold;
                            letter-spacing: 4px;
                            margin: 20px 0;
                        "
                    >
                        ${otp}
                    </div>

                    <p>
                        This OTP will expire in 10 minutes.
                    </p>

                    <p>
                        If you did not request a password reset,
                        please ignore this email.
                    </p>

                    <br />

                    <p>
                        Best regards,<br />
                        <strong>TechFinder Team</strong>
                    </p>
                </div>
            `
        },

        sms: `
            TechFinder OTP: ${data.otp}

            Use this code to reset your password.

            This OTP expires in 10 minutes.

            Do not share this code with anyone.
        `.trim()
    };
};


export default forgotMessageTemplate;