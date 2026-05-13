import pool from '#config/db.js';

import transporter 
from '#lib/emailTransporter.js';

import phoneChangedMessageTemplate 
from '../templates/phone-changed.template.js';

import findActiveUserById from 
'#repositories/user.repository.js';


const phoneChanged = async (data) => {
    const user = await findActiveUserById(
        data.userId
    );

    if(!user){
        throw new Error(
            'User not found'
        );
    }

    const newPhone = user.phone;

    const message = phoneChangedMessageTemplate(
        user.username,
        newPhone
    );

    await transporter.sendMail({
        from: `"TechFinder" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Your TechFinder Phone Number Was Updated',
        text: message.text,
        html: message.html
    });
};


export default phoneChanged;