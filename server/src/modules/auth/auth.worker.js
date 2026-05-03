import { Worker } from 'bullmq';
import redisConnection from '#config/redis';


new Worker(
    "otpQueue",
    async (job) => {
        console.log("📦 Processing Job:", job.name);

        if(job.name === "sendOTPEmail"){
            console.log(`Sending OTP email to ${job.data.email}`);
        }
    },
    {
        connection: redisConnection,
        concurrency: 5,
    }
);

new Worker(
    "emailQueue",
    async (job) => {
        console.log("📦 Processing Job:", job.name);

        if(job.name === "sendWelcomeEmail"){
            console.log(`Sending welcome email to ${job.data.email}`);
        }

        if(job.name === "sendPasswordChangeAlertEmail"){
            console.log(`Sending welcome email to ${job.data.email}`);
        }
        
        if(job.name === "sendPhoneVerifiedSuccessEmail"){
            console.log(`Sending welcome email to ${job.data.email}`);
        }

        if(job.name === "sendNewLoginAlertEmail"){
            console.log(`Sending welcome email to ${job.data.email}`);
        }
    },
    {
        connection: redisConnection,
        concurrency: 5,
    }
);





/*
forgot password OTP
email verification OTP
phone verification OTP
2FA login code
password reset token mail


welcome email after registration
password changed alert
email verified success mail
phone verified success mail
security notification
new login alert
newsletter
*/