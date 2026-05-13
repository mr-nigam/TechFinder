const passwordResetMessageTemplate = (username) => {

    return {
        text: `
            Hello ${username},

            Your TechFinder account password was successfully reset.

            If you made this change, no further action is needed.

            If you did not reset your password, please secure your account immediately.

            Best regards,
            TechFinder Team
        `.trim(),

        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Hello ${username},</h2>

                <p>
                    Your <strong>TechFinder</strong> account password was successfully reset.
                </p>

                <p>
                    If you made this change, no further action is needed.
                </p>

                <p>
                    If you did not reset your password, please secure your account immediately.
                </p>

                <br />

                <p>
                    Best regards,<br />
                    <strong>TechFinder Team</strong>
                </p>
            </div>
        `,
    };
};


export default passwordResetMessageTemplate;