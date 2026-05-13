import nodemailer from 'nodemailer';


const {
    EMAIL_USER,
    EMAIL_PASS,
} = process.env;

if(!EMAIL_USER || !EMAIL_PASS){
    throw new Error(
        'Missing email credentials'
    );
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});


export default transporter;