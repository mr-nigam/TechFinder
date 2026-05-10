import pool from '#config/db.js';

import transporter 
from '#lib/emailTransporter.js';

import welcomeMessageTemplate 
from '../templates/welcome.template.js';


const welcome = async (data) => {
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

    const message = welcomeMessageTemplate(user);

    await transporter.sendMail({
        from: `"TechFinder" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Welcome to TechFinder',
        text: message.text,
        html: message.html
    });
};


export default welcome;