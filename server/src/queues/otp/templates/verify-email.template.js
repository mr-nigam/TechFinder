const verifyEmailMessageTemplate = (username, otp) => {
    return {
        email: {
            subject:
                'Verify Your TechFinder Phone Number',

            text: `
                Hello ${username},

                Use the following OTP to verify your phone number on TechFinder:

                ${otp}

                This OTP will expire in 3 minutes.

                If you did not request this verification, please ignore this email.

                Best regards,
                TechFinder Team
            `.trim(),

            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Hello ${username},</h2>

                    <p>
                        Use the following OTP to verify your
                        <strong>TechFinder</strong> phone number:
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
                        This OTP will expire in 3 minutes.
                    </p>

                    <p>
                        If you did not request this verification,
                        please ignore this email.
                    </p>

                    <br />

                    <p>
                        Best regards,<br />
                        <strong>TechFinder Team</strong>
                    </p>
                </div>
            `
        }
    };
};


export default verifyEmailMessageTemplate;