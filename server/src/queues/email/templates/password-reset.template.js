const passwordResetMessageTemplate = (user) => {
    const fullName = `${user.first_name} ${user.last_name}`;

    return {
        text: `
            Hello ${fullName},

            Your TechFinder account password was successfully reset.

            If you made this change, no further action is needed.

            If you did not reset your password, please secure your account immediately.

            Best regards,
            TechFinder Team
        `.trim(),

        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Hello ${fullName},</h2>

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