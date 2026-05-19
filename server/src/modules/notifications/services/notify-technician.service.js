import sendRealtime from
'#realtime/utils/send.realtime.js';

import {
    getSocket
} from '#realtime/utils/sockets-manager.js';


const notifyTechnician = async({
    event,
    data
})=>{

    const ws = getSocket(
        data.technicianId
    );

    if(!ws){
        return false;
    }

    sendRealtime(
        ws,
        {
            event: event,
            data: {
                bookingRequestId: bookingData.bookingRequestId,
                customerNote: bookingData.customerNote,
                bookingType: bookingData.bookingType,  
                lng: bookingData.lng,  
                lat: bookingData.lat,
                address: bookingData.address,
                baseFee: bookingRequestData.base_fee,
                technicianPayout: bookingRequestData.technician_payout,
                serviceName: bookingRequestData.service_name,
                serviceCategoryName: bookingRequestData.service_category_name,
                estimatedDurationMinutes: bookingRequestData.estimated_duration_minutes,
            }
        }
    );

    return true;
};


export default notifyTechnician;