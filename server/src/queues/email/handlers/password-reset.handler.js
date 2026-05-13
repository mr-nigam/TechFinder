import pool from '#config/db.js';

import transporter 
from '#lib/emailTransporter.js';

import passwordResetMessageTemplate 
from '../templates/password-reset.template.js';

import findActiveUserById from 
'#repositories/user.repository.js';


const passwordReset = async (data) => {
    const user = await findActiveUserById(
        data.userId
    );

    if(!user){
        throw new Error(
            'User not found'
        );
    }

    const message = passwordResetMessageTemplate(
        user.username
    );

    await transporter.sendMail({
        from: `"TechFinder" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Your TechFinder Password Was Reset',
        text: message.text,
        html: message.html
    });
};


export default passwordReset;