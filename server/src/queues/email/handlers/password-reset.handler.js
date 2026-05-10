import pool from '#config/db.js';

import transporter 
from '#lib/emailTransporter.js';

import passwordResetMessageTemplate 
from '../templates/password-reset.template.js';


const passwordReset = async (data) => {
    const query = `
        SELECT
            email,
            first_name,
            last_name
        FROM users
        WHERE id = $1 AND 
            deleted_at IS NULL AND
            deactivated_at IS NULL;
    `;

    const result = await pool.query(
        query,
        [data.userId]
    );

    if(result.rowCount === 0){
        throw new Error(
            "User not found"
        );
    }

    const user = result.rows[0];

    const message = passwordResetMessageTemplate(user);

    await transporter.sendMail({
        from: `"TechFinder" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Your TechFinder Password Was Reset',
        text: message.text,
        html: message.html
    });
};


export default passwordReset;