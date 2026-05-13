import deleteUser
from './handlers/user.handler.js';

import deleteTechnician
from './handlers/technician.handlers.js';

import deleteAddress
from './handlers/address.handler.js';

import deletePhone
from './handlers/phone.handler.js';

import deleteDocument
from './handlers/document.handlers.js';


const cleanupHandlers = {
    "user:delete:":
        deleteUser,
    
    "user:deactivate": 
        deleteUser,
    
    "technician:delete": 
        deleteTechnician,

    "phone:delete":
        deletePhone,
    
    "address:delete":
        deleteAddress,

    "document:delete":
        deleteDocument
};


export default cleanupHandlers;