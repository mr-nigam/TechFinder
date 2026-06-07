const bookingBaseFields = [
    `
    (
        to_jsonb(b)
        - 'user_id'
        - 'technician_id'
        - 'address_id'
        - 'service_category_id'
        - 'service_id'
        - 'payment_id'
        - 'search_session_id'
        - 'booking_request_id'
        - 'customer_phone'
        - 'phone_type'
        - 'scheduled_at'
    ) AS booking
    `
];

const bookingAddressFields = [
    `
    jsonb_build_object(
        'addressLine1', ad.address_line_1,
        'addressLine2', ad.address_line_2,
        'landmark', ad.landmark,
        'city', ad.city,
        'state', ad.state,
        'country', ad.country,
        'pincode', ad.pincode,
        'longitude', ST_X(ad.location::geometry),
        'latitude', ST_Y(ad.location::geometry)
    ) AS address
    `
];

const bookingCustomerFields = [
    `
    jsonb_build_object(
        'id', cu.id,
        'username', cu.username,
        'firstName', cu.first_name,
        'lastName', cu.last_name,
        'profilePicture', cu.profile_picture_url
    ) AS customer
    `
];

const bookingReviewFields = [
    `
    jsonb_build_object(
        'id', r.id,
        'rating', r.rating,
        'title', r.title,
        'body', r.body,
        'isEdited', r.is_edited
    ) AS review
    `
];

const bookingTechnicianFields = [
    `
    jsonb_build_object(
        'id': t.id,
        'username': tu.username,
        'firstName': tu.first_name,
        'lastName': tu.last_name,
        'specialization': t.specialization,
        'profilePicture': tu.profile_picture_url
    ) AS technician
    `
];

const customerFields = [
    ...bookingBaseFields,
    ...bookingAddressFields,
    ...bookingReviewFields,
    ...bookingTechnicianFields
];

const technicianFields = [
    ...bookingBaseFields,
    ...bookingAddressFields,
    ...bookingCustomerFields,
    ...bookingReviewFields
];

export {
    customerFields,
    technicianFields,
    bookingBaseFields,
    bookingAddressFields,
    bookingCustomerFields,
    bookingReviewFields,
    bookingTechnicianFields
};