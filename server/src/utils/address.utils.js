const formatOwnAddress = (address) => ({
    id : address.id,
    address_line_1: address.address_line_1,
    address_line_2: address.address_line_2,
    landmark: address.landmark,
    city: address.city,
    state: address.state,
    country: address.country,
    pincode: address.pincode,
    is_default: address.is_default,
    location: address.location
});

const formatBookingAddress = (address) => ({
    address_line_1: address.address_line_1,
    address_line_2: address.address_line_2,
    landmark: address.landmark,
    city: address.city,
    pincode: address.pincode,
    location: address.location,
});

export {
    formatAddress,
    formatMultipleAddress
};