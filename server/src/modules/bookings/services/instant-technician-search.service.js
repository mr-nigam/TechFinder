import {
    getAddressCoordinates
} from '../repositories/index.js';

import {
    cacheSearchResults,
    getCachedSearchPage,
    setBookingCache
} from '../bookingRedis/cache.js';

import {
    searchActiveTechnicians
} from './index.js';


const instantTechnicianSearch = async (
    bookingDetails
) => {

    if(bookingDetails.searchSessionId){
        return getCachedSearchPage(
            bookingDetails.searchSessionId,
            bookingDetails.page,
            bookingDetails.limit
        );
    }

    const { lng, lat, address} =
        await getAddressCoordinates(
            bookingDetails.addressId,
            bookingDetails.userId
        );

    let technicians =
        await searchActiveTechnicians(
            lng,
            lat,
            bookingDetails.serviceCategoryId
        );

    if(!technicians.length){
        return [];
    }

    const searchSessionId =
        crypto.randomUUID();

    await cacheSearchResults(
        searchSessionId,
        technicians,
    );
    
    bookingDetails.lng = lng;
    bookingDetails.lat = lat;
    bookingDetails.address = address;

    const draftKey = 
        `booking_draft:${searchSessionId}`;

    await setBookingCache(
        draftKey,
        bookingDetails,
        1800
    );

    const nearbyTechs = await getCachedSearchPage(
        searchSessionId,
        bookingDetails.page,
        bookingDetails.limit
    );

    return {
        nearbyTechs,
        searchSessionId
    };
};


export default instantTechnicianSearch;