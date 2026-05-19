const buildBookingRequestPayload  = (
    bookingDetails,
    bookingRequest
)=>{
    return {
        bookingRequestId: bookingRequest.id,
        baseFee: bookingRequest.base_fee,
        technicianPayout: bookingRequest.technician_payout,
        serviceName: bookingRequest.service_name,
        serviceCategoryName: bookingRequest.service_category_name,
        estimatedDurationMinutes: bookingRequest.estimated_duration_minutes,
        customerNote: bookingRequest.customer_note,
        bookingType: bookingRequest.booking_type,  
        
        lng: bookingDetails.lng,  
        lat: bookingDetails.lat,
        address: bookingDetails.address
    }
}


export default buildBookingRequestPayload;