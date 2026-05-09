import deleteAccount
from './handlers/account.handler.js';

import deleteAddress
from './handlers/address.handler.js';

import deletePhone
from './handlers/phone.handler.js';


const cleanupHandlers = {
    "user:delete:account": 
        deleteAccount,
    
    "technician:delete:account": 
        deleteAccount,
    
    "user:deactivate:account": 
        deleteAccount,

    "phone:delete":
        deletePhone,
    
    "address:delete":
        deleteAddress,

    "document:delete":
        deleteAddress
};


export default cleanupHandlers;