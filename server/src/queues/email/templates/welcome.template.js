const welcomeMessageTemplate = (username) => {

    return {
        text: `
            Hello ${username},

            Welcome to TechFinder.

            We're excited to have you onboard.

            You can now explore the platform and discover amazing tech opportunities.

            If you have any questions, feel free to contact our support team.

            Best regards,
            TechFinder Team
        `.trim(),

        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Hello ${username},</h2>

                <p>
                    Welcome to <strong>TechFinder</strong>.
                </p>

                <p>
                    We're excited to have you onboard.
                </p>

                <p>
                    You can now explore the platform and discover amazing services.
                </p>

                <p>
                    If you have any questions, feel free to contact our support team.
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


export default welcomeMessageTemplate;