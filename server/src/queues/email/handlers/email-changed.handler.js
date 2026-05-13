import pool from '#config/db.js';

import transporter 
from '#lib/emailTransporter.js';

import emailChangedMessageTemplate 
from '../templates/email-changed.template.js';

import findActiveUserById from 
'#repositories/user.repository.js';


const emailChanged = async (data) => {
    const user = await findActiveUserById(
        data.userId
    );

    if(!user){
        throw new Error(
            'User not found'
        );
    }

    const newEmail = user.email;

    const message = emailChangedMessageTemplate(
        user.username,
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