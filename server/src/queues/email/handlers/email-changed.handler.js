import pool from '#config/db.js';

import transporter 
from '#lib/emailTransporter.js';

import emailChangedMessageTemplate 
from '../templates/email-changed.template.js';


const emailChanged = async (data) => {
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
    const newEmail = user.email;

    const message = emailChangedMessageTemplate(
        user,
        newEmail
    );

    await transporter.sendMail({
        from: `"TechFinder" <${process.env.EMAIL_USER}>`,
        to: data.oldEmail,
        subject: 'Your TechFinder Email Address Was Updated',
        text: message.text,
        html: message.html
    });
};


export default emailChanged;