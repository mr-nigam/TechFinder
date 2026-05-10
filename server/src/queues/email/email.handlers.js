import welcome
from './handlers/welcome.handlers.js';

import passwordReset
from './handlers/password-reset.handler.js';

import emailChanged
from './handlers/email-changed.handler.js';

import phoneChanged
from './handlers/phone-changed.handler.js';


const emailHandlers = {
    "welcome":
        welcome,
    
    "password-reset":
        passwordReset,
    
    "email-changed":
        emailChanged,
    
    "phone-changed":
        phoneChanged
};


export default emailHandlers;