import {
    getAddressCoordinates
} from '../repositories/index.js';

import {
    searchActiveTechnicians
} from './index.js';

import {
    createBookingsRequest
} from '../repositories/index.js'

import buildBookingRequestPayload from
'../utils/booking-request.utils.js';

import notifyTechnician from
'#notifications/services/index.js';

import {
    getSocket
} from '#realtime/utils/sockets-manager.js';


const dispatchEmergencyBookingRequest = async(
    technicians,
    technicianBookingRequest
) => {
    const totalTechnicians = technicians.length;

    const bookingAccepted = false;

    const batchSize = 5;
    let currentIndex = 0;

    const intervalId = setInterval(() => {
        
        if(bookingAccepted){
            clearInterval(intervalId);
            return;
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

        currentIndex+=batchSize;

    }, 10000);
};

const emergencyBooking = async( 
    bookingDetails 
) =>{

    const searchSessionId =
        crypto.randomUUID();
    
    bookingDetails.searchSessionId = 
        searchSessionId;

    const bookingRequest = 
        await createBookingsRequest(
            bookingDetails
        );
    
    const { lng, lat, address} =
        await getAddressCoordinates(
            bookingDetails.addressId,
            bookingDetails.userId
        );

    bookingRequest.address = address;

    let technicians = await 
        searchActiveTechnicians(
            lng,
            lat,
            bookingDetails.serviceCategoryId
        );

    if(!technicians.length){
        return null;
    }

    const technicianBookingRequest =
        buildBookingRequestPayload(
            bookingDetails,
            bookingRequest
        );
};


export default emergencyBooking;