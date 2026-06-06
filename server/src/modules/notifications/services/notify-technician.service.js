import sendRealtime from
'#realtime/utils/send.realtime.js';

import {
    getSocket
} from '#realtime/utils/sockets-manager.js';


const notifyTechnician = async(
    event,
    data,
    technicianId
)=>{
    const ws = getSocket(
        technicianId
    );

    if(!ws){
        return false;
    }

    sendRealtime(
        ws,
        {
            event: event,
            data: {
                data
            }
        }
    );

    return true;
};


export default notifyTechnician;