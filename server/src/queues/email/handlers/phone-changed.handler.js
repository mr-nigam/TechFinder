import pool from '#config/db.js';

import transporter 
from '#lib/emailTransporter.js';

import phoneChangedMessageTemplate 
from '../templates/phone-changed.template.js';


const phoneChanged = async (data) => {
    const query = `
        SELECT
            email,
            phone,
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
    const newPhone = user.phone;

    const message = phoneChangedMessageTemplate(user,newPhone);

    await transporter.sendMail({
        from: `"TechFinder" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Your TechFinder Phone Number Was Updated',
        text: message.text,
        html: message.html
    });
};


export default phoneChanged;