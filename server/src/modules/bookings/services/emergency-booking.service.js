import pool from 
'#config/database/postgres.js';

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