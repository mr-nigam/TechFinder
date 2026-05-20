import {
    searchActiveTechnicians,
    dispatchEmergencyBookingRequest
} from './index.js';

import {
    getAddressCoordinates,
    createBookingsRequest
} from '../repositories/index.js'

import buildBookingRequestPayload from
'../utils/booking-request.utils.js';


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
    
    const { lng, lat, address } =
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
        return false;
    }

    const technicianBookingRequest =
        buildBookingRequestPayload(
            bookingDetails,
            bookingRequest
        );

    const result = 
        await dispatchEmergencyBookingRequest(
            technicians,
            technicianBookingRequest
        );

    return result;
};


export default emergencyBooking;