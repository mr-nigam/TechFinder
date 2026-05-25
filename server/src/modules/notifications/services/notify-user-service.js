import sendRealtime from
'#realtime/utils/send.realtime.js';

import {
    getSocket
} from '#realtime/utils/sockets-manager.js';


const notifyUser = async({
    event,
    data
})=>{

    const ws = getSocket(
        data.userId
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


export default notifyUser;