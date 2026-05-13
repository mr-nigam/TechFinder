const phoneChangedMessageTemplate = (username, newPhone) => {
    
    return {
        text: `
            Hello ${username},

            Your TechFinder phone number was successfully updated.

            New phone number:
            ${newPhone}

            If you made this change, no further action is needed.

            If you did not update your phone number, please secure your account immediately.

            Best regards,
            TechFinder Team
        `.trim(),

        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Hello ${username},</h2>

                <p>
                    Your <strong>TechFinder</strong> phone number was successfully updated.
                </p>

                <p>
                    <strong>New phone number:</strong><br />
                    ${newPhone}
                </p>

                <p>
                    If you made this change, no further action is needed.
                </p>

                <p>
                    If you did not update your phone number, please secure your account immediately.
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


export default phoneChangedMessageTemplate;