import twilio from 'twilio';


const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
} = process.env;

if(!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN){
    throw new Error(
        500,
        'Missing Twilio credentials'
    );
}

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);


export default client;