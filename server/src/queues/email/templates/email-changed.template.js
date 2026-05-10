const emailChangedMessageTemplate = (user, newEmail) => {
    const fullName = `${user.first_name} ${user.last_name}`;

    return {
        text: `
            Hello ${fullName},

            Your TechFinder email address has been successfully updated.

            New email:
            ${newEmail}

            If you made this change, no further action is needed.

            If you did not change your email address, please secure your account immediately.

            Best regards,
            TechFinder Team
        `.trim(),

        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Hello ${fullName},</h2>

                <p>
                    Your <strong>TechFinder</strong> email address has been successfully updated.
                </p>

                <p>
                    <strong>New email:</strong><br />
                    ${newEmail}
                </p>

                <p>
                    If you made this change, no further action is needed.
                </p>

                <p>
                    If you did not change your email address, please secure your account immediately.
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


export default emailChangedMessageTemplate;