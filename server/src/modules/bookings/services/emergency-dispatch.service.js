import {
    getSocket
} from '#realtime/utils/sockets-manager.js';

import sendRealtime from
'#realtime/utils/send.realtime.js';

const acceptedEmergencyBookings =
    new Map();

const dispatchEmergencyBookingRequest = async(
    technicians,
    technicianBookingRequest
) => {

    const totalTechnicians = technicians.length;

    const bookingRequestId = 
        technicianBookingRequest.bookingRequestId;

    const batchSize = 5;
    let currentIndex = 0;

    const intervalId = setInterval(() => {
        
        const bookingAccepted = 
            acceptedEmergencyBookings.has(
                bookingRequestId    
            );

        if(bookingAccepted){
            clearInterval(intervalId);

            acceptedEmergencyBookings.delete(
                bookingRequestId
            );

            return true;
        }

        if(currentIndex>=totalTechnicians){
            clearInterval(intervalId);
            return;
        };

        for(let i = currentIndex; i<totalTechnicians; i++){
            
            const ws = getSocket(
                technicians[i].technicianId
            );

            sendRealtime(ws, {
                    event: "emergency_booking",
                    data: {
                        booking: technicianBookingRequest
                    }
                }
            );
        }

        currentIndex += batchSize;

    }, 10000);

    return false;
};


export {
    acceptedEmergencyBookings,
    dispatchEmergencyBookingRequest
};