import sendRealtime from
'#realtime/utils/send.realtime.js';

import {
    getSocket
} from '#realtime/utils/sockets-manager.js';


const notifyTechnician = async({
    bookingData
})=>{

    const ws = getSocket(
        bookingData.technicianId
    );

    if(!ws){
        return false;
    }

    sendRealtime(
        ws,
        {
            event: "new_booking_request",
            data: {
                bookingRequestId: bookingData.bookingRequestId,
                customerNote: bookingData.customerNote,
                bookingType: bookingData.bookingType,  
                lng: bookingData.lng,  
                lat: bookingData.lat
            }
        }
    );

    return true;
};


export default notifyTechnician;