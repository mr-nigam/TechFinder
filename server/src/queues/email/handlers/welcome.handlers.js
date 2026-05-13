import pool from '#config/db.js';

import transporter 
from '#lib/emailTransporter.js';

import welcomeMessageTemplate 
from '../templates/welcome.template.js';

import findActiveUserById from 
'#repositories/user.repository.js';


const welcome = async (data) => {
    const user = await findActiveUserById(
        data.userId
    );

    if(!user){
        throw new Error(
            'User not found'
        );
    }

    const message = welcomeMessageTemplate(
        user.username
    );

    await transporter.sendMail({
        from: `"TechFinder" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Welcome to TechFinder',
        text: message.text,
        html: message.html
    });
};


export default welcome;